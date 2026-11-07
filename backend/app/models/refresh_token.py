"""refresh_tokens table — server-side refresh-token session records.

Rows are revoked on rotation/logout; expired rows may be garbage-collected
later without touching user accounts (hence the CASCADE on user deletion).
"""

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    expires_at: Mapped[object] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[object | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(  # noqa: F821
        back_populates="refresh_tokens"
    )

    def __repr__(self) -> str:
        return f"<RefreshToken id={self.id} user={self.user_id}>"
