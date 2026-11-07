"""Customer-facing dashboard summary endpoint (PRD §5.7 / §8.6)."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.booking_repository import BookingRepository
from app.schemas.booking import BookingListenerResponse
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/customer", response_model=SuccessResponse)
def customer_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repository = BookingRepository(db)
    bookings = repository.list_for_user(current_user.id, limit=100)
    now = datetime.now(timezone.utc)

    def status_value(b):
        return b.status.value if hasattr(b.status, "value") else b.status

    counts = {"total": 0, "pending": 0, "confirmed": 0, "completed": 0, "cancelled": 0, "upcoming": 0}
    next_booking = None
    for booking in bookings:
        counts["total"] += 1
        counts[status_value(booking)] += 1
        if booking.slot is not None and booking.slot.start_time >= now and booking.status in ("pending", "confirmed"):
            counts["upcoming"] += 1
            if next_booking is None or booking.slot.start_time < next_booking.slot.start_time:
                next_booking = booking
    recent = sorted(bookings, key=lambda b: b.created_at, reverse=True)[:5]
    data = {
        "totals": counts,
        "next_booking": BookingListenerResponse.model_validate(next_booking) if next_booking else None,
        "recent_bookings": [BookingListenerResponse.model_validate(b) for b in recent],
    }
    return SuccessResponse(message="Customer dashboard data retrieved", data=data)
