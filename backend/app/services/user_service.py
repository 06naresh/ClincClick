"""User service — profile management rules (Phase 06).

Role updates are intentionally NOT supported: customers must never assign
themselves admin privileges (PRD FR-007 / architecture §8.1).
"""

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate


class UserService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = UserRepository(db)

    def update_profile(self, user, payload: UserUpdate):
        updates = payload.model_dump(exclude_unset=True)
        if not updates:
            return user
        # Only permitted fields may change. Disallow any role/active mutation.
        if "role" in updates or "is_active" in updates or "email" in updates:
            # Email changes require verification & therefore live in a later
            # phase; reject silently to be safe.
            updates.pop("role", None)
            updates.pop("is_active", None)
            updates.pop("email", None)
        if "full_name" in updates and (updates["full_name"] or "").strip() == "":
            raise NotFoundError("Full name cannot be empty")
        if "full_name" in updates:
            updates["full_name"] = updates["full_name"].strip()
        return self.repository.update(user, **updates)
