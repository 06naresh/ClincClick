"""Admin service — dashboard statistics (minimal for Phase 03 RBAC checks).

Phase 08 expands this into the full admin reporting layer.
"""

from sqlalchemy.orm import Session

from app.models.booking import BookingStatus
from app.repositories.booking_repository import BookingRepository
from app.repositories.provider_repository import ProviderRepository
from app.repositories.service_repository import ServiceRepository
from app.repositories.user_repository import UserRepository


class AdminService:
    def __init__(self, db: Session) -> None:
        self.booking_repository = BookingRepository(db)
        self.user_repository = UserRepository(db)
        self.service_repository = ServiceRepository(db)
        self.provider_repository = ProviderRepository(db)

    def dashboard_stats(self) -> dict:
        current = BookingStatus
        return {
            "totals": {
                "users": self.user_repository.count_users(),
                "services_active": self.service_repository.count_services(
                    active_only=True
                ),
                "providers_active": self.provider_repository.count_providers(
                    active_only=True
                ),
                "bookings": self.booking_repository.count_bookings(),
            },
            "bookings_by_status": {
                "pending": self.booking_repository.count_bookings(current.PENDING),
                "confirmed": self.booking_repository.count_bookings(current.CONFIRMED),
                "completed": self.booking_repository.count_bookings(current.COMPLETED),
                "cancelled": self.booking_repository.count_bookings(current.CANCELLED),
            },
        }
