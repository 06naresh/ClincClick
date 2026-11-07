"""availability_slots table — bookable appointment time windows."""

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="end_after_start"),
        CheckConstraint("capacity > 0", name="positive_capacity"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    provider_id: Mapped[int] = mapped_column(
        ForeignKey("providers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    start_time: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    end_time: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )
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
    service: Mapped["Service"] = relationship(  # noqa: F821
        back_populates="availability_slots"
    )
    provider: Mapped["Provider"] = relationship(  # noqa: F821
        back_populates="availability_slots"
    )
    bookings: Mapped[list["Booking"]] = relationship(  # noqa: F821
        back_populates="slot"
    )

    def __repr__(self) -> str:
        return (
            f"<AvailabilitySlot id={self.id} service={self.service_id} "
            f"provider={self.provider_id} start={self.start_time} "
            f"capacity={self.capacity}>"
        )
