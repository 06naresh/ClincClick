"""Repository for the services table. Phase 03: count queries for admin
stats; CRUD operations arrive in Phase 04."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.service import Service


class ServiceRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def count_services(self, *, active_only: bool = False) -> int:
        stmt = select(func.count()).select_from(Service)
        if active_only:
            stmt = stmt.where(Service.is_active.is_(True))
        return self.db.scalar(stmt) or 0
