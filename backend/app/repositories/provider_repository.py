"""Repository for the providers table. Phase 03: count queries for admin
stats; CRUD operations arrive in Phase 04."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.provider import Provider


class ProviderRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def count_providers(self, *, active_only: bool = False) -> int:
        stmt = select(func.count()).select_from(Provider)
        if active_only:
            stmt = stmt.where(Provider.is_active.is_(True))
        return self.db.scalar(stmt) or 0
