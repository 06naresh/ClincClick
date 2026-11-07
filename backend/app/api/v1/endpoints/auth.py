"""Authentication endpoints (Tasks 3.1, 3.2, 3.5).

- POST /auth/register  — create a customer, returns the user (no tokens)
- POST /auth/login     — verify credentials, issue access + refresh(*) token
- POST /auth/refresh   — rotate a refresh-token cookie into a fresh access token
- POST /auth/logout    — revoke the presented refresh token
- GET  /auth/me        — current authenticated user

(*) Refresh token lives in an HTTP-only cookie; JS never sees it.
"""

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import (
    enforce_auth_rate_limit,
    get_current_user,
)
from app.db.session import get_db
from app.core.exceptions import UnauthorizedError
from app.models.user import User
from app.schemas.auth import AuthDataResponse, LoginRequest, RegisterRequest
from app.schemas.common import SuccessResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _cookie_path() -> str:
    # Restrict the cookie to the refresh endpoint's scope (best practice).
    return "/api/v1/auth"


def _set_refresh_cookie(response: Response, raw_token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=raw_token,
        httponly=True,
        samesite="lax",
        secure=settings.REFRESH_COOKIE_SECURE,
        path=_cookie_path(),
        max_age=int(settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600),
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        path=_cookie_path(),
        samesite="lax",
        secure=settings.REFRESH_COOKIE_SECURE,
    )


@router.post("/register", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db),
    _rate_limits: None = Depends(enforce_auth_rate_limit),
) -> SuccessResponse:
    """Public customer registration (admin role is never assignable here)."""
    user = AuthService(db).register_user(payload)
    return SuccessResponse(
        message="Account created successfully. You can now log in.",
        data=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=SuccessResponse)
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    _rate_limits: None = Depends(enforce_auth_rate_limit),
) -> SuccessResponse:
    """Verify credentials and issue an access token + refresh-token cookie."""
    auth_service = AuthService(db)
    user = auth_service.authenticate(payload)
    issued = auth_service.issue_login(user)

    _set_refresh_cookie(response, issued["refresh_token"])

    data = AuthDataResponse(
        access_token=issued["access_token"],
        user=UserResponse.model_validate(user),
        role=user.role,
    )
    return SuccessResponse(message="Login successful", data=data)


@router.post("/refresh", response_model=SuccessResponse)
def refresh_session(
    request: Request, response: Response, db: Session = Depends(get_db)
) -> SuccessResponse:
    """Rotate the refresh-token cookie into a fresh access token."""
    raw_refresh = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if not raw_refresh:
        raise UnauthorizedError("Refresh token missing")
    auth_service = AuthService(db)
    issued = auth_service.refresh_access_token(raw_refresh)

    _set_refresh_cookie(response, issued["refresh_token"])
    data = AuthDataResponse(
        access_token=issued["access_token"],
        user=UserResponse.model_validate(issued["user"]),
        role=issued["user"].role,
    )
    return SuccessResponse(message="Session refreshed", data=data)


@router.post("/logout", response_model=SuccessResponse)
def logout(
    request: Request, response: Response, db: Session = Depends(get_db)
) -> SuccessResponse:
    """Revoke the presented refresh token and clear the cookie."""
    raw_refresh = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    AuthService(db).logout(raw_refresh)
    _clear_refresh_cookie(response)
    return SuccessResponse(message="Logged out successfully")


@router.get("/me", response_model=SuccessResponse)
def me(current_user: User = Depends(get_current_user)) -> SuccessResponse:
    """Return the authenticated user (Task 3.5)."""
    return SuccessResponse(
        message="Current user retrieved",
        data=UserResponse.model_validate(current_user),
    )
