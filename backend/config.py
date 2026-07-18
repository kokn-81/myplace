import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


def load_env_file() -> None:
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return

    with env_path.open("r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file()


def get_database_url() -> str:
    url = os.getenv("DATABASE_URL", "").strip()
    if not url:
        return f"sqlite:///{(BASE_DIR / 'inmobiliaria.db').as_posix()}"

    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)

    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)

    return url


DATABASE_URL = get_database_url()
IS_SQLITE = DATABASE_URL.startswith("sqlite")
AUTO_CREATE_TABLES = os.getenv("AUTO_CREATE_TABLES", "true").strip().lower() not in {"0", "false", "no"}


def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:5173,https://nia-web.com,https://www.nia-web.com")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


CORS_ORIGINS = get_cors_origins()


def get_csv_env(name: str) -> list[str]:
    raw = os.getenv(name, "")
    return [item.strip().lower() for item in raw.split(",") if item.strip()]


FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "myplace-cc527").strip()
ADMIN_EMAILS = get_csv_env("ADMIN_EMAILS")
AUTHORIZED_ADVISOR_EMAILS = get_csv_env("AUTHORIZED_ADVISOR_EMAILS")

FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "").strip()
FIREBASE_SERVICE_ACCOUNT_JSON = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
