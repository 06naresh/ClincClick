"""Service schemas — create/update/read."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ServiceBase(BaseModel):
    name: str = Field(max_length=150)
    description: str | None = None
    duration_minutes: int = Field(gt=0)
    price: float = Field(ge=0)
    is_active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    """Partial update: all fields optional."""

    name: str | None = Field(default=None, max_length=150)
    description: str | None = None
    duration_minutes: int | None = Field(default=None, gt=0)
    price: float | None = Field(default=None, ge=0)
    is_active: bool | None = None


class ServiceResponse(ServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
