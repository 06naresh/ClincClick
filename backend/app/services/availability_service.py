"""Business rules for availability slots."""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.availability_slot import AvailabilitySlot
from app.repositories.availability_repository import AvailabilityRepository
from app.schemas.availability import AvailabilitySlotCreate, AvailabilitySlotUpdate
from app.utils.datetime_utils import ensure_utc


class AvailabilityService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = AvailabilityRepository(db)

    def get(self, slot_id: int) -> AvailabilitySlot:
        slot = self.repository.get_by_id(slot_id)
        if slot is None:
            raise NotFoundError("Appointment slot not found")
        return slot

    def list_slots(
        self,
        *,
        service_id=None,
        provider_id=None,
        start_from=None,
        start_until=None,
        active_only=True,
    ):
        return self.repository.list_slots(
            active_only=active_only,
            service_id=service_id,
            provider_id=provider_id,
            start_at=start_from,
            end_at=start_until,
        )

    def create(self, data: AvailabilitySlotCreate) -> AvailabilitySlot:
        start = ensure_utc(data.start_time)
        end = ensure_utc(data.end_time)
        # Business rule: no new past availability.
        if start < datetime.now(timezone.utc):
            raise ConflictError("Approval slots cannot be created in the past")

        from app.models.service import Service
        from app.models.provider import Provider

        service = self.db.get(Service, data.service_id)
        if service is None or not service.is_active:
            raise ConflictError("Service is not available for booking")
        provider = self.db.get(Provider, data.provider_id)
        if provider is None or not provider.is_active:
            raise ConflictError("Provider is not available")

        if self.repository.has_overlap(provider_id=data.provider_id, start_time=start, end_time=end):
            raise ConflictError("Provider already has another slot overlapping this time")

        return self.repository.create(
            service_id=data.service_id,
            provider_id=data.provider_id,
            start_time=start,
            end_time=end,
            capacity=data.capacity,
            is_active=data.is_active,
        )

    def update(self, slot_id: int, patch: AvailabilitySlotUpdate) -> AvailabilitySlot:
        slot = self.get(slot_id)
        updates = patch.model_dump(exclude_unset=True)

        if "service_id" in updates:
            from app.models.service import Service

            service = self.db.get(Service, updates["service_id"])
            if service is None or not service.is_active:
                raise ConflictError("Service is not available for booking")
        if "provider_id" in updates or "start_time" in updates or "end_time" in updates:
            start = ensure_utc(updates.get("start_time", slot.start_time))
            end = ensure_utc(updates.get("end_time", slot.end_time))
            provider_id = updates.get("provider_id", slot.provider_id)
            if end <= start:
                raise ConflictError("end_time must be after start_time")
            if self.repository.has_overlap(
                provider_id=provider_id,
                start_time=start,
                end_time=end,
                exclude_id=slot.id,
            ):
                raise ConflictError("Provider already has another slot overlapping this time")
            updates["start_time"] = start
            updates["end_time"] = end

        return self.repository.update(slot, **updates)

    def set_active(self, slot_id: int, active: bool) -> AvailabilitySlot:
        slot = self.get(slot_id)
        return self.repository.set_active(slot, active)
