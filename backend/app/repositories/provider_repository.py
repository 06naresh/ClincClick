"""Repository for the providers table."""

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.provider import Provider


class ProviderRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, provider_id: int) -> Provider | None:
        return self.db.get(Provider, provider_id)

    def list_providers(
        self,
        *,
        active_only: bool = True,
        search: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Provider]:
        stmt = select(Provider)
        if active_only:
            stmt = stmt.where(Provider.is_active.is_(True))
        if search:
            like = f"%{search}%"
            stmt = stmt.where(Provider.full_name.ilike(like))
        stmt = stmt.order_by(Provider.full_name.asc()).offset(skip).limit(limit)
        return list(self.db.scalars(stmt).all())

    def count_providers(self, *, active_only: bool = False, search: str | None = None) -> int:
        stmt = select(func.count()).select_from(Provider)
        if active_only:
            stmt = stmt.where(Provider.is_active.is_(True))
        if search:
            like = f"%{search}%"
            stmt = stmt.where(Provider.full_name.ilike(like))
        return self.db.scalar(stmt) or 0

    def create(self, full_name, specialization=None, bio=None, is_active=True) -> Provider:
        provider = Provider(
            full_name=full_name,
            specialization=specialization,
            bio=bio,
            is_active=is_active,
        )
        self.db.add(provider)
        self.db.commit()
        self.db.refresh(provider)
        return provider

    def update(self, provider, **fields) -> Provider:
        changed = False
        for key, value in fields.items():
            if value is not None and hasattr(provider, key):
                setattr(provider, key, value)
                changed = True
            elif key in {"specialization", "bio"} and value is None and value is not ...:
                # only clear when explicitly passed as None — keep simple below
                pass
        if changed:
            self.db.commit()
            self.db.refresh(provider)
        return provider

    def set_active(self, provider, active) -> Provider:
        provider.is_active = active
        self.db.commit()
        self.db.refresh(provider)
        return provider
