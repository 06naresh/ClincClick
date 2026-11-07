"""Database engine and session management.

- DATABASE_URL comes from core/config.py (backend/.env) — never hardcoded.
- get_db() is the FastAPI dependency used by API endpoints; Phase 02 wires it
  through the API router automatically for later phases.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # drop dead connections instead of raising on use
    pool_size=5,
    max_overflow=10,
    echo=False,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def get_db() -> Session:
    """Yield a database session for one request, then close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
