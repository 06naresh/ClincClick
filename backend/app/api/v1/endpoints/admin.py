"""Administrator dashboard endpoint (stats) + booking management (Phase 05).

Note: a minimal admin dashboard existed in Phase 03; extended here with
booking list and status management.
"""

from datetime import date
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models.booking import BookingStatus
from app.models.user import User
from app.schemas.booking import BookingListenerResponse
from app.schemas.common import SuccessResponse
from app.services.admin_service import AdminService
from app.services.booking_service import BookingService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=SuccessResponse)
def admin_dashboard(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    stats = AdminService(db).dashboard_stats()
    return SuccessResponse(message="Admin dashboard data retrieved", data=stats)


@router.get("/bookings", response_model=SuccessResponse)
def list_all_bookings(
    status: BookingStatus | None = Query(default=None),
    service_id: int | None = Query(default=None, ge=1),
    provider_id: int | None = Query(default=None, ge=1),
    user_id: int | None = Query(default=None, ge=1),
    start_from: date | None = Query(default=None),
    start_until: date | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    bookings = BookingService(db).list_for_admin(
        status=status,
        service_id=service_id,
        provider_id=provider_id,
        user_id=user_id,
        start_from=start_from,
        start_until=start_until,
        skip=skip,
        limit=limit,
    )
    return SuccessResponse(
        message="All bookings retrieved",
        data=[BookingListenerResponse.model_validate(b) for b in bookings],
    )


@router.patch("/bookings/{booking_id}/status", response_model=SuccessResponse)
def update_booking_status(
    booking_id: int,
    status: BookingStatus,
    reason: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    booking = BookingService(db).update_booking_status(
        booking_id=booking_id,
        new_status=status,
        acting_user_id=current_admin.id,
        reason=reason,
    )
    return SuccessResponse(
        message="Booking status updated",
        data=BookingListenerResponse.model_validate(booking),
    )
