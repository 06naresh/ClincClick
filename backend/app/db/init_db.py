r"""Secure administrator bootstrap to run manually:

    cd backend
    venv\Scripts\activate
    python -m app.db.init_db

Credentials come ONLY from the backend/.env environment variables (see
ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_FULL_NAME). Public registration never
creates an admin account, so this is the intended setup path (PRD §1.3,
architecture §8.1).
"""

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository


def ensure_admin(db: Session) -> User | None:
    """Create the configured admin account if ADMIN_EMAIL/PASSWORD set; else None.

    A second run is a no-op when the account already exists.
    """
    email = (settings.ADMIN_EMAIL or "").strip().lower()
    password = (settings.ADMIN_PASSWORD or "").strip()

    if not email or not password:
        print("Admin bootstrap skipped: ADMIN_EMAIL/ADMIN_PASSWORD not set.")
        return None

    repository = UserRepository(db)
    existing = repository.get_by_email(email)
    if existing is not None:
        print(f"Admin already exists: {existing.email} (id={existing.id})")
        return existing

    full_name = (settings.ADMIN_FULL_NAME or "Administrator").strip() or "Administrator"
    user = repository.create_user(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        role=UserRole.ADMIN,
    )
    print(f"Admin account created: {user.email} (id={user.id})")
    return user


def main() -> None:
    db = SessionLocal()
    try:
        ensure_admin(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
