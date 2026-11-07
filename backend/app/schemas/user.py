"""User schemas — Phase 02 covers request/response shape only.

Registration/login request handling lives in schemas/auth.py in Phase 03.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class UserResponse(BaseModel):
    """Public user representation — NEVER includes password_hash."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    phone: str | None = None
    role: UserRole
    is_active: bool
    created_at: datetime


class UserUpdate(BaseModel):
    """Permitted profile updates (full_name / phone).

    The role, is_active and email fields are deliberately absent so that
    clients cannot (even accidentally) escalate privileges or change email
    without the dedicated verification flow.
    """

    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    phone: str | None = Field(default=None, max_length=20)
