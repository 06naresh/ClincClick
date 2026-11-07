"""Booking endpoints (Task 5.2-5.9)."""

from datetime import datetime

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.booking_repository import BookingRepository
from app.schemas.booking import (
    BookingCreate,
    BookingHistoryResponse,
    BookingListenerResponse,
    BookingReschedule,
)
from app.schemas.common import SuccessResponse
from app.models.booking import BookingStatus
from app.services.booking_service import BookingService

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def _serialize_booking(b):
    item = BookingListenerResponse.model_validate(b)
    slot = getattr(b, "slot", None)
    if slot is not None:
        item.slot_start_time = slot.start_time
        item.slot_end_time = slot.end_time
        item.service_id = slot.service_id
        item.provider_id = slot.provider_id
    return item




def _is_admin(user: User) -> bool:
    return user.role.value == "admin"


@router.post("", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = BookingService(db).create_booking(
        user_id=current_user.id,
        slot_id=payload.slot_id,
        reason=payload.reason,
        is_admin=_is_admin(current_user),
    )
    reference = booking.booking_reference
    return SuccessResponse(
        message="Booking created successfully",
        data=_serialize_booking(booking),
    )


@router.get("/my", response_model=SuccessResponse)
def my_bookings(
    status: BookingStatus | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = BookingService(db).list_for_user(
        current_user.id, status=status, skip=skip, limit=limit
    )
    return SuccessResponse(
        message="Your bookings retrieved",
        data=[_serialize_booking(b) for b in bookings],
    )


@router.get("/{booking_id}", response_model=SuccessResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = BookingService(db).get_booking(
        booking_id,
        acting_user_id=current_user.id,
        is_admin=_is_admin(current_user),
    )
    return SuccessResponse(
        message="Booking retrieved",
        data=_serialize_booking(booking),
    )


@router.patch("/{booking_id}/reschedule", response_model=SuccessResponse)
def reschedule_booking(
    booking_id: int,
    payload: BookingReschedule,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = BookingService(db).reschedule_booking(
        booking_id=booking_id,
        new_slot_id=payload.new_slot_id,
        acting_user_id=current_user.id,
        is_admin=_is_admin(current_user),
        reason=payload.reason,
    )
    return SuccessResponse(
        message="Booking rescheduled successfully",
        data=_serialize_booking(booking),
    )


@router.patch("/{booking_id}/cancel", response_model=SuccessResponse)
def cancel_booking(
    booking_id: int,
    reason: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = BookingService(db).cancel_booking(
        booking_id=booking_id,
        acting_user_id=current_user.id,
        is_admin=_is_admin(current_user),
        reason=reason,
    )
    return SuccessResponse(
        message="Booking cancelled successfully",
        data=_serialize_booking(booking),
    )


@router.get("/{booking_id}/history", response_model=SuccessResponse)
def get_booking_history(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = BookingService(db).get_booking_history(
        booking_id=booking_id,
        acting_user_id=current_user.id,
        is_admin=_is_admin(current_user),
    )
    return SuccessResponse(
        message="Booking history retrieved",
        data=[BookingHistoryResponse.model_validate(h) for h in history],
    )
