"""Authentication request/response schemas (Phase 03).

Security rules reflected here:
- Public registration NEVER accepts a role field — the backend always assigns
  the customer role (PRD FR-001).
- Access tokens are returned in the body; refresh tokens never appear in any
  response payload (they travel only in HTTP-only cookies).
"""

import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import UserRole
from app.schemas.user import UserResponse

# Defined password policy (documented in README; tighten on request):
# - 8-72 characters
# - at least one letter and one digit
_PASSWORD_RULE = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,72}$")
# Phone: digits, spaces, +, -, parentheses; 6-20 characters.
_PHONE_RULE = re.compile(r"^[0-9+\-\s()]{6,20}$")


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if value and not _PHONE_RULE.match(value):
            raise ValueError("Phone may contain digits, spaces, + - ( ) only")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not _PASSWORD_RULE.match(value):
            raise ValueError(
                "Password must be 8-72 characters and include at least "
                "one letter and one digit"
            )
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class AuthDataResponse(BaseModel):
    """Login/refresh payload: access token + safe user representation."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    role: UserRole


class AuthMessageResponse(BaseModel):
    """Register/logout responses (no credentials returned)."""

    pass
