import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env.local")
load_dotenv(PROJECT_ROOT / ".env")

VERCEL_ENV = os.environ.get("VERCEL_ENV")
IS_VERCEL_DEPLOYMENT = VERCEL_ENV in {"production", "preview"} or (
    os.environ.get("VERCEL") == "1" and VERCEL_ENV != "development"
)

database_url = os.environ.get("DATABASE_URL")
if not database_url:
    if IS_VERCEL_DEPLOYMENT:
        raise RuntimeError("DATABASE_URL must be set for Vercel deployments.")
    database_url = "sqlite:///./agriwise.db"


def _normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+psycopg://", 1)
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


def _create_database_engine(database_url: str):
    normalized_url = _normalize_database_url(database_url)
    return create_engine(
        normalized_url,
        connect_args=(
            {"check_same_thread": False}
            if normalized_url.startswith("sqlite:")
            else {}
        ),
    )


SQLALCHEMY_DATABASE_URL = _normalize_database_url(database_url)
engine = _create_database_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def create_migration_engine():
    migration_url = os.environ.get("DATABASE_URL_UNPOOLED")
    if not migration_url:
        migration_url = os.environ.get("DATABASE_URL")
        if migration_url:
            parsed_url = make_url(_normalize_database_url(migration_url))
            if parsed_url.host and "-pooler" in parsed_url.host:
                raise RuntimeError(
                    "DATABASE_URL_UNPOOLED must be set to a direct PostgreSQL URL "
                    "for database initialization."
                )

    if not migration_url:
        if IS_VERCEL_DEPLOYMENT:
            raise RuntimeError(
                "Set DATABASE_URL_UNPOOLED to initialize PostgreSQL on Vercel."
            )
        migration_url = "sqlite:///./agriwise.db"

    normalized_url = _normalize_database_url(migration_url)
    parsed_url = make_url(normalized_url)
    if parsed_url.host and "-pooler" in parsed_url.host:
        raise RuntimeError(
            "Database initialization requires a direct PostgreSQL URL, not a pooled URL."
        )

    return _create_database_engine(normalized_url)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
