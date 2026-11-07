"""Provider schemas — create/update/read."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProviderBase(BaseModel):
    full_name: str = Field(max_length=150)
    specialization: str | None = Field(default=None, max_length=120)
    bio: str | None = None
    is_active: bool = True


class ProviderCreate(ProviderBase):
    pass


class ProviderUpdate(BaseModel):
    """Partial update: all fields optional."""

    full_name: str | None = Field(default=None, max_length=150)
    specialization: str | None = Field(default=None, max_length=120)
    bio: str | None = None
    is_active: bool | None = None


class ProviderResponse(ProviderBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
