"""Repository for the bookings table. Phase 03: count queries for admin
stats; booking operations arrive in Phase 05."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus


class BookingRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def count_bookings(self, status: BookingStatus | None = None) -> int:
        stmt = select(func.count()).select_from(Booking)
        if status is not None:
            stmt = stmt.where(Booking.status == status)
        return self.db.scalar(stmt) or 0
