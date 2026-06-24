import json
from pathlib import Path
from typing import Any, Literal, Optional

from fastapi import Depends, Header, HTTPException, status
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials, initialize_app, get_app
from sqlalchemy.orm import Session

from config import BASE_DIR, FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH
from database import SessionLocal
from models import UsuarioAutorizadoDB

AppRole = Literal["admin", "advisor", "user"]


def normalize_email(email: Optional[str]) -> str:
    return (email or "").strip().lower()


def get_firebase_credential():
    if FIREBASE_SERVICE_ACCOUNT_JSON:
        return credentials.Certificate(json.loads(FIREBASE_SERVICE_ACCOUNT_JSON))

    if FIREBASE_SERVICE_ACCOUNT_PATH:
        service_account_path = Path(FIREBASE_SERVICE_ACCOUNT_PATH)
        if not service_account_path.is_absolute():
            service_account_path = BASE_DIR / service_account_path
        return credentials.Certificate(str(service_account_path))

    return credentials.ApplicationDefault()


def init_firebase_admin() -> None:
    try:
        get_app()
    except ValueError:
        initialize_app(get_firebase_credential(), {"projectId": FIREBASE_PROJECT_ID})


init_firebase_admin()


def get_db_for_auth():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_role_for_email(db: Session, email: Optional[str]) -> AppRole:
    normalized = normalize_email(email)
    if not normalized:
        return "user"

    user = db.query(UsuarioAutorizadoDB).filter(UsuarioAutorizadoDB.email == normalized).first()
    if user and user.role in {"admin", "advisor"}:
        return user.role  # type: ignore[return-value]
    return "user"


def upsert_authorized_user(db: Session, email: Optional[str], role: AppRole) -> None:
    normalized = normalize_email(email)
    if not normalized or role == "user":
        return

    user = db.query(UsuarioAutorizadoDB).filter(UsuarioAutorizadoDB.email == normalized).first()
    if user:
        if user.role != "admin":
            user.role = role
        return

    db.add(UsuarioAutorizadoDB(email=normalized, role=role))


def get_current_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de Firebase requerido.")

    token = authorization.split(" ", 1)[1].strip()
    try:
        decoded = firebase_auth.verify_id_token(token, check_revoked=False)
    except Exception as exc:
        print(f"Firebase token verification failed: {exc}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de Firebase invalido.") from exc

    email = normalize_email(decoded.get("email"))
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El token no contiene email verificado.")

    return {
        "uid": decoded.get("uid") or decoded.get("sub"),
        "email": email,
        "name": decoded.get("name") or decoded.get("display_name") or email,
    }


def get_current_profile(
    current_user: dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db_for_auth),
) -> dict[str, Any]:
    return {**current_user, "role": get_role_for_email(db, current_user.get("email"))}


def require_admin(profile: dict[str, Any] = Depends(get_current_profile)) -> dict[str, Any]:
    if profile["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permisos de administrador requeridos.")
    return profile


def require_advisor_or_admin(profile: dict[str, Any] = Depends(get_current_profile)) -> dict[str, Any]:
    if profile["role"] not in {"admin", "advisor"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permisos de asesor requeridos.")
    return profile



