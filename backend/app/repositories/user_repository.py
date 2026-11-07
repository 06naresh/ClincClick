"""Repository for the users table.

Repositories own all SQLAlchemy queries; services call them and never touch
the database session directly (md_files/architecture.md section 6.3).
"""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.user import User, UserRole


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return self.db.scalar(stmt)

    def email_exists(self, email: str) -> bool:
        stmt = select(func.count()).select_from(User).where(User.email == email)
        return bool(self.db.scalar(stmt) or 0)

    def create_user(
        self,
        *,
        full_name: str,
        email: str,
        password_hash: str,
        phone: str | None = None,
        role: UserRole = UserRole.CUSTOMER,
    ) -> User:
        user = User(
            full_name=full_name,
            email=email,
            password_hash=password_hash,
            phone=phone,
            role=role,
        )
        self.db.add(user)
        self.db.commit()          # registration is a standalone transaction
        self.db.refresh(user)
        return user

    def count_users(self) -> int:
        stmt = select(func.count()).select_from(User)
        return self.db.scalar(stmt) or 0
