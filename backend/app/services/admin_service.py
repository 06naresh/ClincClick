"""Administrator service — aggregation for the admin dashboard (Phase 08)."""

from datetime import datetime, timezone
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.availability_slot import AvailabilitySlot
from app.models.booking import Booking, BookingStatus
from app.models.provider import Provider
from app.models.service import Service
from app.models.user import User
from app.repositories.booking_repository import BookingRepository
from app.repositories.provider_repository import ProviderRepository
from app.repositories.service_repository import ServiceRepository
from app.repositories.user_repository import UserRepository


class AdminService:
    def __init__(self, db: Session) -> None:
        self.booking_repository = BookingRepository(db)
        self.user_repository = UserRepository(db)
        self.service_repository = ServiceRepository(db)
        self.provider_repository = ProviderRepository(db)
        self.db = db

    def dashboard_stats(self) -> dict:
        all_statuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CANCELLED]
        by_status = {s.value: self.booking_repository.count_bookings(status=s) for s in all_statuses}
        total_bookings = sum(by_status.values())
        # Today's appointments = bookings whose slot starts today (UTC)
        today = datetime.now(timezone.utc).date()
        today_count_stmt = (
            select(func.count())
            .select_from(Booking)
            .join(AvailabilitySlot, AvailabilitySlot.id == Booking.slot_id)
            .where(func.date(AvailabilitySlot.start_time) == today)
        )
        today_count = self.db.scalar(today_count_stmt) or 0
        # Upcoming
        upcoming_stmt = select(func.count()).select_from(Booking).join(
            AvailabilitySlot, AvailabilitySlot.id == Booking.slot_id
        ).where(
            AvailabilitySlot.start_time >= datetime.now(timezone.utc),
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
        )
        upcoming_count = self.db.scalar(upcoming_stmt) or 0

        # Recent appointments (last 10 by creation)
        recent_bookings = self.booking_repository.list_for_admin(limit=10)

        return {
            "totals": {
                "users": self.user_repository.count_users(),
                "services_active": self.service_repository.count_services(active_only=True),
                "providers_active": self.provider_repository.count_providers(active_only=True),
                "bookings": total_bookings,
            },
            "bookings_by_status": by_status,
            "upcoming_bookings": upcoming_count,
            "today_bookings": today_count,
            "recent_bookings": recent_bookings,
        }
