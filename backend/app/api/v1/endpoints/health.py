"""Health check endpoints (Task 2.8).

Reports API liveness and separate database connectivity so the environment
and deployment health can be monitored independently. A failed database
probe must not return a success status (HTTP 503).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def health_check():
    """API liveness probe (no database access)."""
    return {"success": True, "message": "Service Booking API is healthy"}


@router.get("/db")
def database_health_check(db: Session = Depends(get_db)):
    """Database connectivity probe: HTTP 503 when the database is unreachable."""
    try:
        value = db.execute(text("SELECT 1")).scalar()
        connected = value == 1
    except Exception:
        connected = False

    if not connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connectivity check failed",
        )

    return {"success": True, "message": "API is healthy", "database": "connected"}
