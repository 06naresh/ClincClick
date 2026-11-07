"""FastAPI authentication and authorization dependencies.

- get_current_user: validates the Bearer token and loads the active user.
- require_admin: role gate used by admin-only endpoints.

Both raise domain exceptions handled centrally in app/main.py, so callers get
consistent `{success, message, errors}` responses.
"""

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.utils.rate_limiter import SlidingWindowRateLimiter

_bearer_scheme = HTTPBearer(auto_error=False, description="JWT access token")

# Shared limiter used by login and register endpoints (Task 3 requirements).
auth_rate_limiter = SlidingWindowRateLimiter(
    max_attempts=settings.RATE_LIMIT_AUTH_ATTEMPTS,
    window_seconds=settings.RATE_LIMIT_AUTH_WINDOW_SECONDS,
)


def enforce_auth_rate_limit(request: Request) -> None:
    """Rate-limit dependency for authentication endpoints (keyed by IP)."""
    client_ip = request.client.host if request.client else "unknown"
    auth_rate_limiter.allow_or_raise(client_ip)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the authenticated user from the Authorization header."""
    if credentials is None:
        raise UnauthorizedError("Authentication required")

    try:
        payload = decode_access_token(credentials.credentials)
    except ValueError as exc:
        raise UnauthorizedError(
            f"Invalid or expired session ({exc})"
        ) from exc

    user_id = int(payload["sub"])
    user = UserRepository(db).get_by_id(user_id)

    if user is None or not user.is_active:
        raise UnauthorizedError("Account not found or inactive")

    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    """Ensure the authenticated user has the admin role."""
    if user.role.value != "admin":
        raise ForbiddenError("Administrator privileges required")
    return user
