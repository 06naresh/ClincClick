"""Application configuration.

All values are loaded from environment variables (backend/.env) using
pydantic-settings. Credentials and secrets must never be hardcoded here.

The path to `.env` is resolved relative to this file so the backend works
regardless of the current working directory (important for `pytest` invocations
from the repository root).
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BASE_DIR = Path(__file__).resolve().parents[2]  # backend/


class Settings(BaseSettings):
    """Central application settings, sourced from backend/.env."""

    model_config = SettingsConfigDict(
        env_file=str(_BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    APP_NAME: str = "Service Booking API"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = ""

    # JWT / authentication
    SECRET_KEY: str = "CHANGE_ME"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # Rate limiting for authentication endpoints (in-memory, per IP).
    RATE_LIMIT_AUTH_ATTEMPTS: int = 50  # raised for dev; tighten to 10 in production
    RATE_LIMIT_AUTH_WINDOW_SECONDS: int = 60

    # Refresh-token cookie (HTTP-only; frontend JS must never read this).
    REFRESH_COOKIE_NAME: str = "refresh_token"
    REFRESH_COOKIE_SECURE: bool = False  # set True behind HTTPS

    # Secure admin bootstrap (python -m app.db.init_db) — set via .env only.
    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD: str = ""
    ADMIN_FULL_NAME: str = ""


settings = Settings()
