"""Availability slot endpoints (Task 4.3)."""

from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_optional, require_admin
from app.core.exceptions import ForbiddenError
from app.db.session import get_db
from app.models.user import User
from app.schemas.availability import (
    AvailabilitySlotCreate,
    AvailabilitySlotResponse,
    AvailabilitySlotUpdate,
)
from app.schemas.common import SuccessResponse
from app.services.availability_service import AvailabilityService

router = APIRouter(prefix="/availability", tags=["Availability"])


@router.get("", response_model=SuccessResponse)
def list_slots(
    service_id: int | None = Query(default=None, ge=1),
    provider_id: int | None = Query(default=None, ge=1),
    start_from: str | None = Query(default=None, description="ISO date YYYY-MM-DD"),
    start_until: str | None = Query(default=None, description="ISO date YYYY-MM-DD"),
    include_inactive: bool = Query(default=False),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=200, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    if include_inactive:
        if current_user is None or current_user.role.value != "admin":
            raise ForbiddenError("Only administrators can list inactive slots")

    # Parse date filters into datetimes for services.
    from datetime import datetime, timezone

    sf = None
    su = None
    if start_from:
        try:
            sf = datetime.combine(
                date.fromisoformat(start_from), datetime.min.time(), tzinfo=timezone.utc
            )
        except ValueError:
            raise ForbiddenError("start_from must be YYYY-MM-DD")
    if start_until:
        try:
            su = datetime.combine(
                date.fromisoformat(start_until), datetime.max.time(), tzinfo=timezone.utc
            )
        except ValueError:
            raise ForbiddenError("start_until must be YYYY-MM-DD")

    slots = AvailabilityService(db).list_slots(
        service_id=service_id,
        provider_id=provider_id,
        start_from=sf,
        start_until=su,
        active_only=not include_inactive,
    )
    # offset + limit applied manually since repository supports them already.
    slots = slots[skip : skip + limit]
    return SuccessResponse(
        message="Availability slots retrieved",
        data=[AvailabilitySlotResponse.model_validate(s) for s in slots],
    )


@router.get("/{slot_id}", response_model=SuccessResponse)
def get_slot(slot_id: int, db: Session = Depends(get_db)):
    slot = AvailabilityService(db).get(slot_id)
    return SuccessResponse(
        message="Slot retrieved",
        data=AvailabilitySlotResponse.model_validate(slot),
    )


@router.post("", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
def create_slot(
    payload: AvailabilitySlotCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    slot = AvailabilityService(db).create(payload)
    return SuccessResponse(
        message="Availability slot created successfully",
        data=AvailabilitySlotResponse.model_validate(slot),
    )


@router.patch("/{slot_id}", response_model=SuccessResponse)
def update_slot(
    slot_id: int,
    payload: AvailabilitySlotUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    slot = AvailabilityService(db).update(slot_id, payload)
    return SuccessResponse(
        message="Availability slot updated successfully",
        data=AvailabilitySlotResponse.model_validate(slot),
    )


@router.patch("/{slot_id}/status", response_model=SuccessResponse)
def set_slot_status(
    slot_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    slot = AvailabilityService(db).set_active(slot_id, is_active)
    return SuccessResponse(
        message="Availability slot status updated",
        data=AvailabilitySlotResponse.model_validate(slot),
    )
