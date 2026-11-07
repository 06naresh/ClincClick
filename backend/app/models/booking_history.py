"""booking_history table — audit trail for every booking lifecycle event.

Every status change AND every reschedule must append a row here. This table
is the historical record required by md_files/architecture.md section 5.3
(including previous/new slot references for reschedules).
"""

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BookingHistory(Base):
    __tablename__ = "booking_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    old_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    new_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    old_slot_id: Mapped[int | None] = mapped_column(
        ForeignKey("availability_slots.id", ondelete="SET NULL"), nullable=True
    )
    new_slot_id: Mapped[int | None] = mapped_column(
        ForeignKey("availability_slots.id", ondelete="SET NULL"), nullable=True
    )
    changed_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    change_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    changed_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    booking: Mapped["Booking"] = relationship(  # noqa: F821
        back_populates="history"
    )
    changed_by_user: Mapped["User | None"] = relationship("User")  # noqa: F821

    def __repr__(self) -> str:
        return (
            f"<BookingHistory id={self.id} booking={self.booking_id} "
            f"event={self.event_type}>"
        )
