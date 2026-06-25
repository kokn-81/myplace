from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config import ADMIN_EMAILS, AUTHORIZED_ADVISOR_EMAILS, AUTO_CREATE_TABLES, DATABASE_URL, IS_SQLITE


engine_options = {"pool_pre_ping": True}
if IS_SQLITE:
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db() -> None:
    # Local-first convenience. In production, set AUTO_CREATE_TABLES=false and run Alembic.
    if AUTO_CREATE_TABLES:
        from models import AgenteDB, InmuebleDB, UsuarioAutorizadoDB  # noqa: F401

        Base.metadata.create_all(bind=engine)
        ensure_sqlite_agent_email_column()
        ensure_sqlite_inmueble_banos_column()
    seed_authorized_users()


def ensure_sqlite_agent_email_column() -> None:
    if not IS_SQLITE:
        return

    with engine.begin() as conn:
        columns = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(agentes)").fetchall()]
        if columns and "email" not in columns:
            conn.exec_driver_sql("ALTER TABLE agentes ADD COLUMN email VARCHAR")




def ensure_sqlite_inmueble_banos_column() -> None:
    if not IS_SQLITE:
        return

    with engine.begin() as conn:
        columns = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(inmuebles)").fetchall()]
        if columns and "banos" not in columns:
            conn.exec_driver_sql("ALTER TABLE inmuebles ADD COLUMN banos INTEGER DEFAULT 1")
            conn.exec_driver_sql("UPDATE inmuebles SET banos = 1 WHERE banos IS NULL")


def seed_authorized_users() -> None:
    from models import UsuarioAutorizadoDB

    if not ADMIN_EMAILS and not AUTHORIZED_ADVISOR_EMAILS:
        return

    with SessionLocal() as db:
        for email in ADMIN_EMAILS:
            upsert_role(db, email, "admin")
        for email in AUTHORIZED_ADVISOR_EMAILS:
            upsert_role(db, email, "advisor")
        db.commit()


def upsert_role(db, email: str, role: str) -> None:
    from models import UsuarioAutorizadoDB

    normalized = (email or "").strip().lower()
    if not normalized:
        return

    user = db.query(UsuarioAutorizadoDB).filter(UsuarioAutorizadoDB.email == normalized).first()
    if user:
        if user.role != "admin":
            user.role = role
        return

    db.add(UsuarioAutorizadoDB(email=normalized, role=role))


