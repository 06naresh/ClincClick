"""Service endpoints (Task 4.1)."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_optional, require_admin
from app.core.exceptions import ForbiddenError
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import SuccessResponse
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate
from app.services.service_service import ServiceService

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=SuccessResponse)
def list_services(
    search: str | None = Query(default=None),
    include_inactive: bool = Query(default=False),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    if include_inactive:
        if current_user is None or current_user.role.value != "admin":
            raise ForbiddenError("Only administrators can list inactive services")
    services = ServiceService(db).list_services(
        search=search, include_inactive=include_inactive, skip=skip, limit=limit
    )
    return SuccessResponse(
        message="Services retrieved",
        data=[ServiceResponse.model_validate(s) for s in services],
    )


@router.get("/{service_id}", response_model=SuccessResponse)
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = ServiceService(db).get(service_id)
    return SuccessResponse(
        message="Service retrieved",
        data=ServiceResponse.model_validate(service),
    )


@router.post("", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    service = ServiceService(db).create(payload)
    return SuccessResponse(
        message="Service created successfully",
        data=ServiceResponse.model_validate(service),
    )


@router.patch("/{service_id}", response_model=SuccessResponse)
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    service = ServiceService(db).update(service_id, payload)
    return SuccessResponse(
        message="Service updated successfully",
        data=ServiceResponse.model_validate(service),
    )


@router.patch("/{service_id}/status", response_model=SuccessResponse)
def set_service_status(
    service_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    service = ServiceService(db).set_active(service_id, is_active)
    return SuccessResponse(
        message="Service status updated",
        data=ServiceResponse.model_validate(service),
    )
