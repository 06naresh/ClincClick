"""Repository for the bookings table (Phase 05)."""

from datetime import date, datetime, time, timezone
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.booking_history import BookingHistory
from app.models.availability_slot import AvailabilitySlot
from app.models.booking import Booking, BookingStatus
from app.utils.datetime_utils import ensure_utc


class BookingRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, booking_id: int) -> Booking | None:
        return self.db.get(Booking, booking_id)

    def get_by_reference(self, reference: str) -> Booking | None:
        stmt = select(Booking).where(Booking.booking_reference == reference)
        return self.db.scalar(stmt)

    def list_for_user(
        self,
        user_id: int,
        *,
        status: BookingStatus | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Booking]:
        stmt = select(Booking).where(Booking.user_id == user_id)
        if status is not None:
            stmt = stmt.where(Booking.status == status)
        stmt = stmt.order_by(Booking.created_at.desc()).offset(skip).limit(limit)
        return self.db.scalars(stmt).all()

    def list_for_admin(
        self,
        *,
        status: BookingStatus | None = None,
        service_id: int | None = None,
        provider_id: int | None = None,
        user_id: int | None = None,
        start_from: date | None = None,
        start_until: date | None = None,
        skip: int = 0,
        limit: int = 200,
    ) -> Sequence[Booking]:
        stmt = select(Booking).join(
            AvailabilitySlot, AvailabilitySlot.id == Booking.slot_id
        )
        if status is not None:
            stmt = stmt.where(Booking.status == status)
        if user_id is not None:
            stmt = stmt.where(Booking.user_id == user_id)
        if service_id is not None:
            stmt = stmt.where(AvailabilitySlot.service_id == service_id)
        if provider_id is not None:
            stmt = stmt.where(AvailabilitySlot.provider_id == provider_id)
        if start_from is not None:
            stmt = stmt.where(AvailabilitySlot.start_time >= ensure_utc(
                datetime.combine(start_from, time.min)
            ))
        if start_until is not None:
            stmt = stmt.where(AvailabilitySlot.start_time <= ensure_utc(
                datetime.combine(start_until, time.max)
            ))
        stmt = stmt.order_by(Booking.created_at.desc()).offset(skip).limit(limit)
        return self.db.scalars(stmt).all()

    def count_active_for_slot(self, slot_id: int) -> int:
        stmt = select(func.count()).select_from(Booking).where(
            Booking.slot_id == slot_id,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
        )
        return self.db.scalar(stmt) or 0

    def lock_slot(self, slot_id: int) -> AvailabilitySlot | None:
        stmt = select(AvailabilitySlot).where(
            AvailabilitySlot.id == slot_id
        ).with_for_update()
        return self.db.scalar(stmt)

    def booking_reference_exists(self, reference: str) -> bool:
        stmt = select(func.count()).select_from(Booking).where(
            Booking.booking_reference == reference,
        )
        return bool(self.db.scalar(stmt) or 0)

    def create_booking(
        self,
        *,
        user_id: int,
        slot_id: int,
        reference: str,
        reason: str | None = None,
        status: BookingStatus = BookingStatus.PENDING,
    ) -> Booking:
        booking = Booking(
            booking_reference=reference,
            user_id=user_id,
            slot_id=slot_id,
            status=status,
            reason=reason,
        )
        self.db.add(booking)
        self.db.flush()
        return booking

    def set_status(self, booking: Booking, new_status: BookingStatus) -> Booking:
        booking.status = new_status
        self.db.flush()
        return booking

    def reschedule(self, booking: Booking, new_slot_id: int) -> Booking:
        booking.slot_id = new_slot_id
        self.db.flush()
        return booking

    def append_history(
        self,
        *,
        booking_id: int,
        event_type: str,
        old_status: BookingStatus | None = None,
        new_status: BookingStatus | None = None,
        old_slot_id: int | None = None,
        new_slot_id: int | None = None,
        changed_by: int | None = None,
        change_reason: str | None = None,
    ) -> BookingHistory:
        record = BookingHistory(
            booking_id=booking_id,
            event_type=event_type,
            old_status=old_status.value if old_status else None,
            new_status=new_status.value if new_status else None,
            old_slot_id=old_slot_id,
            new_slot_id=new_slot_id,
            changed_by=changed_by,
            change_reason=change_reason,
        )
        self.db.add(record)
        self.db.flush()
        return record

    def count_bookings(self, *, status: BookingStatus | None = None) -> int:
        stmt = select(func.count()).select_from(Booking)
        if status is not None:
            stmt = stmt.where(Booking.status == status)
        return self.db.scalar(stmt) or 0
