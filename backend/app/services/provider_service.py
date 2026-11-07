"""Business rules for providers."""

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.repositories.provider_repository import ProviderRepository
from app.schemas.provider import ProviderCreate, ProviderUpdate


class ProviderService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = ProviderRepository(db)

    def get(self, provider_id: int):
        provider = self.repository.get_by_id(provider_id)
        if provider is None:
            raise NotFoundError("Provider not found")
        return provider

    def list_providers(self, *, search=None, include_inactive=False, skip=0, limit=100):
        return self.repository.list_providers(
            active_only=not include_inactive,
            search=search,
            skip=skip,
            limit=limit,
        )

    def create(self, data: ProviderCreate):
        return self.repository.create(
            full_name=data.full_name.strip(),
            specialization=data.specialization.strip() if data.specialization else None,
            bio=data.bio,
            is_active=data.is_active,
        )

    def update(self, provider_id: int, patch: ProviderUpdate):
        provider = self.get(provider_id)
        updates = patch.model_dump(exclude_unset=True)
        if "full_name" in updates:
            updates["full_name"] = (updates["full_name"] or "").strip()
            if not updates["full_name"]:
                raise ValueError("full_name cannot be empty")
        if "specialization" in updates and updates["specialization"] is not None:
            updates["specialization"] = updates["specialization"].strip()
        return self.repository.update(provider, **updates)

    def set_active(self, provider_id: int, active: bool):
        provider = self.get(provider_id)
        return self.repository.set_active(provider, active)
