"""Domain-level exceptions.

These represent expected business failures (auth, ownership, conflicts).
A central exception handler in app/main.py converts them into the standard
error envelope with the correct HTTP status code — endpoints and services
raise them without worrying about response formatting.
"""

from fastapi import status


class DomainError(Exception):
    """Base exception for expected business failures."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    message: str = "Invalid request"

    def __init__(self, message: str | None = None) -> None:
        if message:
            self.message = message
        super().__init__(self.message)


class UnauthorizedError(DomainError):
    status_code = status.HTTP_401_UNAUTHORIZED
    message = "Authentication required"


class InvalidCredentialsError(DomainError):
    status_code = status.HTTP_401_UNAUTHORIZED
    message = "Invalid email or password"


class ForbiddenError(DomainError):
    status_code = status.HTTP_403_FORBIDDEN
    message = "Insufficient permissions"


class NotFoundError(DomainError):
    status_code = status.HTTP_404_NOT_FOUND
    message = "Resource not found"


class ConflictError(DomainError):
    status_code = status.HTTP_409_CONFLICT
    message = "Resource conflict"
