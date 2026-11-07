"""Repository for availability_slots with overlap/conflict detection."""

from datetime import datetime
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.availability_slot import AvailabilitySlot


class AvailabilityRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, slot_id: int) -> AvailabilitySlot | None:
        return self.db.get(AvailabilitySlot, slot_id)

    def list_slots(
        self,
        *,
        active_only: bool = True,
        service_id: int | None = None,
        provider_id: int | None = None,
        start_at: datetime | None = None,
        end_at: datetime | None = None,
        skip: int = 0,
        limit: int = 500,
    ) -> list[AvailabilitySlot]:
        stmt = select(AvailabilitySlot)
        if active_only:
            stmt = stmt.where(AvailabilitySlot.is_active.is_(True))
        if service_id is not None:
            stmt = stmt.where(AvailabilitySlot.service_id == service_id)
        if provider_id is not None:
            stmt = stmt.where(AvailabilitySlot.provider_id == provider_id)
        if start_at is not None:
            stmt = stmt.where(AvailabilitySlot.end_time >= start_at)  # overlap-friendly cutoff
        if end_at is not None:
            stmt = stmt.where(AvailabilitySlot.start_time <= end_at)
        stmt = stmt.order_by(AvailabilitySlot.start_time.asc()).offset(skip).limit(limit)
        return list(self.db.scalars(stmt).all())

    def count_slots(self, **kwargs) -> int:
        return len(self.list_slots(**{k: v for k, v in kwargs.items() if v is not None or k in ("active_only",)}, skip=0, limit=10000))

    def create(self, *, service_id, provider_id, start_time, end_time, capacity, is_active=True) -> AvailabilitySlot:
        slot = AvailabilitySlot(
            service_id=service_id,
            provider_id=provider_id,
            start_time=start_time,
            end_time=end_time,
            capacity=capacity,
            is_active=is_active,
        )
        self.db.add(slot)
        self.db.commit()
        self.db.refresh(slot)
        return slot

    def update(self, slot, **fields) -> AvailabilitySlot:
        for key, value in fields.items():
            if value is not None:
                setattr(slot, key, value)
        self.db.commit()
        self.db.refresh(slot)
        return slot

    def set_active(self, slot, active: bool) -> AvailabilitySlot:
        slot.is_active = active
        self.db.commit()
        self.db.refresh(slot)
        return slot

    def has_overlap(self, *, provider_id, start_time, end_time, exclude_id=None) -> bool:
        stmt = select(func.count()).select_from(AvailabilitySlot).where(
            AvailabilitySlot.provider_id == provider_id,
            AvailabilitySlot.is_active.is_(True),
            AvailabilitySlot.end_time > start_time,
            AvailabilitySlot.start_time < end_time,
        )
        if exclude_id is not None:
            stmt = stmt.where(AvailabilitySlot.id != exclude_id)
        return bool(self.db.scalar(stmt) or 0)
