"""Booking schemas — create/reschedule/read."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    slot_id: int
    reason: str | None = Field(default=None, max_length=1000)


class BookingReschedule(BaseModel):
    new_slot_id: int
    reason: str | None = Field(default=None, max_length=1000)


class BookingListenerResponse(BaseModel):
    """Rich representation combining booking data with service/provider info.

    Populated by the booking service layer when Phase 05 is implemented.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_reference: str
    user_id: int
    slot_id: int
    slot_start_time: datetime | None = None
    slot_end_time: datetime | None = None
    service_id: int | None = None
    provider_id: int | None = None
    status: BookingStatus
    reason: str | None = None
    created_at: datetime
    updated_at: datetime


class BookingHistoryResponse(BaseModel):
    """A single booking-history event."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    event_type: Literal[
        "created", "confirmed", "rescheduled", "cancelled", "completed", "updated"
    ]
    old_status: BookingStatus | None = None
    new_status: BookingStatus | None = None
    old_slot_id: int | None = None
    new_slot_id: int | None = None
    change_reason: str | None = None
    changed_at: datetime
