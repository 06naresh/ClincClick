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
