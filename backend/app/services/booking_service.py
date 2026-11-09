"""Booking business logic — capacity-safe, transactional (Task 5.x)."""

from datetime import date, datetime, timezone
from typing import Sequence
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.models.availability_slot import AvailabilitySlot
from app.models.booking import Booking, BookingStatus
from app.models.booking_history import BookingHistory
from app.models.service import Service
from app.models.provider import Provider
from app.repositories.booking_repository import BookingRepository
from app.utils.datetime_utils import utc_now


class InvalidBookingTransition(ConflictError):
    message = "This booking state change is not allowed"


_ALLOWED_ADMIN_TRANSITIONS: dict[BookingStatus, set[BookingStatus]] = {
    BookingStatus.PENDING: {BookingStatus.CONFIRMED, BookingStatus.CANCELLED},
    BookingStatus.CONFIRMED: {BookingStatus.CANCELLED, BookingStatus.COMPLETED},
    BookingStatus.CANCELLED: set(),
    BookingStatus.COMPLETED: set(),
}

_TERMINAL_STATUSES = {BookingStatus.CANCELLED, BookingStatus.COMPLETED}


class BookingService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = BookingRepository(db)

    # --- ownership helper ----------------------------------------------------

    def _load_for_customer_or_admin(
        self,
        booking_id: int,
        *,
        acting_user_id: int,
        is_admin: bool,
    ) -> Booking:
        booking = self.repository.get_by_id(booking_id)
        if booking is None:
            raise NotFoundError("Booking not found")
        if not is_admin and booking.user_id != acting_user_id:
            raise ForbiddenError("You can only access your own bookings")
        return booking

    def _generate_reference(self) -> str:
        for _ in range(10):
            candidate = "BK-{}-{}".format(
                utc_now().strftime("%Y%m%d"),
                uuid4().hex[:6].upper(),
            )
            if not self.repository.booking_reference_exists(candidate):
                return candidate
        raise ConflictError("Could not generate a unique booking reference")

    # --- Task 5.2: create (Task 5.3 capacity-safe) ----------------------------

    def create_booking(
        self,
        *,
        user_id: int,
        slot_id: int,
        reason: str | None = None,
        is_admin: bool = False,
    ) -> Booking:
        """Create a booking safely using row-level locking on the slot."""
        self.db.rollback()
        with self.db.begin():
            slot = self.repository.lock_slot(slot_id)
            if slot is None:
                raise NotFoundError("Availability slot not found")
            if not slot.is_active:
                raise ConflictError("The selected slot is no longer available")
            if slot.start_time <= utc_now():
                raise ConflictError("Cannot book a slot in the past")

            # Validate service/provider are still active.
            service = self.db.get(Service, slot.service_id)
            provider = self.db.get(Provider, slot.provider_id)
            if service is None or not service.is_active:
                raise ConflictError("The selected service is no longer available")
            if provider is None or not provider.is_active:
                raise ConflictError("The selected provider is no longer available")

            # Duplicate: same customer already has an active booking on this slot.
            existing_stmt = select(func.count()).select_from(Booking).where(
                Booking.user_id == user_id,
                Booking.slot_id == slot_id,
                Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
            )
            already_booked = self.db.scalar(existing_stmt) or 0
            if already_booked > 0:
                raise ConflictError("You already have an active booking for this slot")

            active = self.repository.count_active_for_slot(slot_id)
            if active >= slot.capacity:
                raise ConflictError(
                    "The selected slot is fully booked",
                )

            reference = self._generate_reference()
            booking = self.repository.create_booking(
                user_id=user_id,
                slot_id=slot_id,
                reference=reference,
                reason=reason,
                status=BookingStatus.PENDING,
            )
            self.repository.append_history(
                booking_id=booking.id,
                event_type="created",
                old_status=None,
                new_status=BookingStatus.PENDING,
                new_slot_id=slot_id,
                changed_by=user_id,
                change_reason="Initial booking",
            )
        # session committed at end of begin block
        return booking

    # --- Task 5.4 listing ----------------------------------------------------

    def get_booking(self, booking_id: int, *, acting_user_id: int, is_admin: bool) -> Booking:
        return self._load_for_customer_or_admin(
            booking_id, acting_user_id=acting_user_id, is_admin=is_admin
        )

    def list_for_user(self, user_id: int, *, status=None, skip=0, limit=100):
        return self.repository.list_for_user(
            user_id, status=status, skip=skip, limit=limit
        )

    def list_for_admin(self, **filters):
        return self.repository.list_for_admin(**filters)

    # --- Task 5.6 reschedule --------------------------------------------------

    def reschedule_booking(
        self,
        *,
        booking_id: int,
        new_slot_id: int,
        acting_user_id: int,
        is_admin: bool,
        reason: str | None = None,
    ) -> Booking:
        self.db.rollback()
        with self.db.begin():
            booking = self._load_for_customer_or_admin(
                booking_id, acting_user_id=acting_user_id, is_admin=is_admin
            )
            if booking.status in _TERMINAL_STATUSES:
                raise InvalidBookingTransition(
                    "A cancelled or completed booking cannot be rescheduled"
                )
            if booking.status not in (BookingStatus.PENDING, BookingStatus.CONFIRMED):
                raise InvalidBookingTransition("This booking is not reschedulable")

            # lock the current slot too (consistency)
            old_slot = self.repository.lock_slot(booking.slot_id)
            if old_slot is None:
                raise NotFoundError("The current slot no longer exists")
            if old_slot.start_time < utc_now():
                raise ConflictError("Cannot reschedule a past appointment")

            new_slot = self.repository.lock_slot(new_slot_id)
            if new_slot is None:
                raise NotFoundError("New availability slot not found")
            if not new_slot.is_active:
                raise ConflictError("The selected slot is no longer available")
            if new_slot.start_time <= utc_now():
                raise ConflictError("Cannot book a slot in the past")

            service = self.db.get(Service, new_slot.service_id)
            provider = self.db.get(Provider, new_slot.provider_id)
            if service is None or not service.is_active:
                raise ConflictError("The selected service is no longer available")
            if provider is None or not provider.is_active:
                raise ConflictError("The selected provider is no longer available")

            if new_slot_id == booking.slot_id:
                raise ConflictError("The new slot must differ from the current one")

            # Capacity check (active bookings, excluding the booking being moved)
            active_new = self._count_active_for_slot_excluding(
                new_slot_id, booking.id
            )
            if active_new >= new_slot.capacity:
                raise ConflictError("The selected slot is fully booked")

            old_slot_id = booking.slot_id
            self.repository.append_history(
                booking_id=booking.id,
                event_type="rescheduled",
                old_status=booking.status,
                new_status=booking.status,
                old_slot_id=old_slot_id,
                new_slot_id=new_slot_id,
                changed_by=acting_user_id,
                change_reason=reason,
            )
            self.repository.reschedule(booking, new_slot_id)
        return booking

    def _count_active_for_slot_excluding(
        self, slot_id: int, booking_id: int
    ) -> int:
        stmt = select(func.count()).select_from(Booking).where(
            Booking.slot_id == slot_id,
            Booking.id != booking_id,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
        )
        return self.db.scalar(stmt) or 0

    # --- Task 5.7 cancel ----------------------------------------------------

    def cancel_booking(
        self,
        *,
        booking_id: int,
        acting_user_id: int,
        is_admin: bool,
        reason: str | None = None,
    ) -> Booking:
        self.db.rollback()
        with self.db.begin():
            booking = self._load_for_customer_or_admin(
                booking_id, acting_user_id=acting_user_id, is_admin=is_admin
            )
            if booking.status == BookingStatus.CANCELLED:
                raise ConflictError("This booking is already cancelled")
            if booking.status == BookingStatus.COMPLETED:
                raise ConflictError("Completed bookings cannot be cancelled")
            if booking.status not in (BookingStatus.PENDING, BookingStatus.CONFIRMED):
                raise ConflictError("This booking cannot be cancelled")

            slot_id = booking.slot_id
            self.repository.append_history(
                booking_id=booking.id,
                event_type="cancelled",
                old_status=booking.status,
                new_status=BookingStatus.CANCELLED,
                old_slot_id=slot_id,
                new_slot_id=slot_id,
                changed_by=acting_user_id,
                change_reason=reason,
            )
            self.repository.set_status(booking, BookingStatus.CANCELLED)
        return booking

    # --- Task 5.8 admin status update ---------------------------------------

    def update_booking_status(
        self,
        *,
        booking_id: int,
        new_status: BookingStatus,
        acting_user_id: int,
        reason: str | None = None,
    ) -> Booking:
        self.db.rollback()
        with self.db.begin():
            booking = self.repository.get_by_id(booking_id)
            if booking is None:
                raise NotFoundError("Booking not found")
            current = booking.status
            if new_status == BookingStatus.COMPLETED:
                slot = self.repository.lock_slot(booking.slot_id)
                if slot is not None and slot.start_time > utc_now():
                    raise ConflictError(
                        "A booking can only be completed after its appointment time"
                    )
            if new_status not in _ALLOWED_ADMIN_TRANSITIONS[current]:
                raise ConflictError(
                    f"Transition {current.value} -> {new_status.value} not allowed",
                )
            event = new_status.value  # confirmed/cancelled/completed
            self.repository.append_history(
                booking_id=booking.id,
                event_type=event,
                old_status=current,
                new_status=new_status,
                old_slot_id=booking.slot_id,
                new_slot_id=booking.slot_id,
                changed_by=acting_user_id,
                change_reason=reason,
            )
            self.repository.set_status(booking, new_status)
        return booking

    # --- helpers for services ------------------------------------------------

    def get_booking_history(self, booking_id: int, *, acting_user_id: int, is_admin: bool):
        booking = self._load_for_customer_or_admin(
            booking_id, acting_user_id=acting_user_id, is_admin=is_admin
        )
        # Imported at call time to keep model relations consistent.
        from sqlalchemy import select as _select
        from app.models.booking_history import BookingHistory

        stmt = _select(BookingHistory).where(BookingHistory.booking_id == booking.id)
        return self.db.scalars(stmt).all()
