"""Provider endpoints (Task 4.2)."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_optional, require_admin
from app.core.exceptions import ForbiddenError
from app.db.session import get_db
from app.schemas.common import SuccessResponse
from app.schemas.provider import ProviderCreate, ProviderResponse, ProviderUpdate
from app.models.user import User
from app.services.provider_service import ProviderService

router = APIRouter(prefix="/providers", tags=["Providers"])


@router.get("", response_model=SuccessResponse)
def list_providers(
    search: str | None = Query(default=None),
    include_inactive: bool = Query(default=False),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    if include_inactive:
        if current_user is None or current_user.role.value != "admin":
            raise ForbiddenError("Only administrators can list inactive providers")
    providers = ProviderService(db).list_providers(
        search=search, include_inactive=include_inactive, skip=skip, limit=limit
    )
    return SuccessResponse(
        message="Providers retrieved",
        data=[ProviderResponse.model_validate(p) for p in providers],
    )


@router.get("/{provider_id}", response_model=SuccessResponse)
def get_provider(provider_id: int, db: Session = Depends(get_db)):
    provider = ProviderService(db).get(provider_id)
    return SuccessResponse(
        message="Provider retrieved",
        data=ProviderResponse.model_validate(provider),
    )


@router.post("", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
def create_provider(
    payload: ProviderCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    provider = ProviderService(db).create(payload)
    return SuccessResponse(
        message="Provider created successfully",
        data=ProviderResponse.model_validate(provider),
    )


@router.patch("/{provider_id}", response_model=SuccessResponse)
def update_provider(
    provider_id: int,
    payload: ProviderUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    provider = ProviderService(db).update(provider_id, payload)
    return SuccessResponse(
        message="Provider updated successfully",
        data=ProviderResponse.model_validate(provider),
    )


@router.patch("/{provider_id}/status", response_model=SuccessResponse)
def set_provider_status(
    provider_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    provider = ProviderService(db).set_active(provider_id, is_active)
    return SuccessResponse(
        message="Provider status updated",
        data=ProviderResponse.model_validate(provider),
    )
