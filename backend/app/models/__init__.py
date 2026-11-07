"""SQLAlchemy ORM models.

Import all model modules here so that Alembic autogenerate can discover the
full metadata (models must also be imported before migration generation).
"""

from app.models.user import User
from app.models.service import Service
from app.models.provider import Provider
from app.models.availability_slot import AvailabilitySlot
from app.models.booking import Booking
from app.models.booking_history import BookingHistory
from app.models.refresh_token import RefreshToken

__all__ = [
    "User",
    "Service",
    "Provider",
    "AvailabilitySlot",
    "Booking",
    "BookingHistory",
    "RefreshToken",
]
