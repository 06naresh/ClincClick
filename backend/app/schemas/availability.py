"""Availability slot schemas — create/update/read.

Times are timezone-aware UTC datetimes; the frontend converts to local time
for display (md_files/design.md and PRD section 6.7).
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class AvailabilitySlotBase(BaseModel):
    service_id: int
    provider_id: int
    start_time: datetime
    end_time: datetime
    capacity: int = Field(default=1, gt=0)
    is_active: bool = True

    @model_validator(mode="after")
    def validate_slot_times(self) -> "AvailabilitySlotBase":
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class AvailabilitySlotCreate(AvailabilitySlotBase):
    pass


class AvailabilitySlotUpdate(BaseModel):
    """Partial update: all fields optional."""

    service_id: int | None = None
    provider_id: int | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    capacity: int | None = Field(default=None, gt=0)
    is_active: bool | None = None


class AvailabilitySlotResponse(AvailabilitySlotBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
