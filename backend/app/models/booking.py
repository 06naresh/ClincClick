"""bookings table — customer appointment reservations."""

import enum

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


def booking_status_values(enum_cls: type[enum.Enum]) -> list[str]:
    """Store the lowercase values ('pending'/'confirmed'/...) in the database
    instead of the uppercase Python member names."""
    return [member.value for member in enum_cls]


class Booking(Base):
    __tablename__ = "bookings"

    __table_args__ = (
        CheckConstraint(
            "booking_reference <> ''", name="reference_not_empty"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    booking_reference: Mapped[str] = mapped_column(
        String(50), nullable=False, unique=True, index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    slot_id: Mapped[int] = mapped_column(
        ForeignKey("availability_slots.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    status: Mapped[BookingStatus] = mapped_column(
        Enum(
            BookingStatus, name="booking_status", values_callable=booking_status_values
        ),
        nullable=False,
        default=BookingStatus.PENDING,
        server_default="pending",
        index=True,
    )
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[object] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    user: Mapped["User"] = relationship(  # noqa: F821
        back_populates="bookings"
    )
    slot: Mapped["AvailabilitySlot"] = relationship(  # noqa: F821
        back_populates="bookings"
    )
    history: Mapped[list["BookingHistory"]] = relationship(  # noqa: F821
        back_populates="booking"
    )

    def __repr__(self) -> str:
        return (
            f"<Booking id={self.id} ref={self.booking_reference} "
            f"status={self.status.value}>"
        )
