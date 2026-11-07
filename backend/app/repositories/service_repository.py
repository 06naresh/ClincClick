"""Repository for the services table.

Handles CRUD queries; all business decisions (validation, soft-delete) live
in the service layer.
"""

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.service import Service


class ServiceRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, service_id: int) -> Service | None:
        return self.db.get(Service, service_id)

    def list_services(
        self,
        *,
        active_only: bool = True,
        search: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Service]:
        stmt = select(Service)
        if active_only:
            stmt = stmt.where(Service.is_active.is_(True))
        if search:
            like = f"%{search}%"
            stmt = stmt.where(
                or_(Service.name.ilike(like), Service.description.ilike(like))
            )
        stmt = stmt.order_by(Service.name.asc()).offset(skip).limit(limit)
        return list(self.db.scalars(stmt).all())

    def count_services(self, *, active_only: bool = False, search: str | None = None) -> int:
        stmt = select(func.count()).select_from(Service)
        if active_only:
            stmt = stmt.where(Service.is_active.is_(True))
        if search:
            like = f"%{search}%"
            stmt = stmt.where(
                or_(Service.name.ilike(like), Service.description.ilike(like))
            )
        return self.db.scalar(stmt) or 0

    def create(self, *, name, description=None, duration_minutes, price, is_active=True) -> Service:
        service = Service(
            name=name,
            description=description,
            duration_minutes=duration_minutes,
            price=price,
            is_active=is_active,
        )
        self.db.add(service)
        self.db.commit()
        self.db.refresh(service)
        return service

    def update(self, service, **fields) -> Service:
        changed = False
        for key, value in fields.items():
            if value is not None and hasattr(service, key):
                setattr(service, key, value)
                changed = True
            elif value is None and key in {"description", "duration_minutes", "price"}:
                # allow clearing description only
                if key == "description":
                    setattr(service, key, value)
                    changed = True
        if changed:
            self.db.commit()
            self.db.refresh(service)
        return service

    def set_active(self, service, active: bool) -> Service:
        service.is_active = active
        self.db.commit()
        self.db.refresh(service)
        return service
