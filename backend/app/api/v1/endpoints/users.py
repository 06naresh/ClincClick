"""User profile endpoints (read + update permitted fields only)."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import SuccessResponse
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=SuccessResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return SuccessResponse(message="Profile retrieved", data=UserResponse.model_validate(current_user))


@router.patch("/me", response_model=SuccessResponse)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = UserService(db).update_profile(current_user, payload)
    return SuccessResponse(
        message="Profile updated successfully",
        data=UserResponse.model_validate(updated),
    )
