"""Business rules for services."""

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.service import Service
from app.repositories.service_repository import ServiceRepository
from app.schemas.service import ServiceCreate, ServiceUpdate


class ServiceService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = ServiceRepository(db)

    def get(self, service_id: int) -> Service:
        service = self.repository.get_by_id(service_id)
        if service is None:
            raise NotFoundError("Service not found")
        return service

    def list_services(self, *, search=None, include_inactive=False, skip=0, limit=100):
        return self.repository.list_services(
            active_only=not include_inactive,
            search=search,
            skip=skip,
            limit=limit,
        )

    def create(self, data: ServiceCreate) -> Service:
        if not data.name.strip():
            raise ConflictError("Service name is required")
        return self.repository.create(
            name=data.name.strip(),
            description=data.description,
            duration_minutes=data.duration_minutes,
            price=data.price,
            is_active=data.is_active,
        )

    def update(self, service_id: int, patch: ServiceUpdate) -> Service:
        service = self.get(service_id)
        updates = patch.model_dump(exclude_unset=True)
        if "name" in updates and not (updates.get("name") or "").strip():
            raise ConflictError("Service name cannot be blank")
        if "name" in updates:
            updates["name"] = updates["name"].strip()
        return self.repository.update(service, **updates)

    def set_active(self, service_id: int, active: bool) -> Service:
        service = self.get(service_id)
        return self.repository.set_active(service, active)
