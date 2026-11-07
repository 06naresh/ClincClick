"""Administrator dashboard endpoint (HR-03.6 RBAC verification + Phase 08 start)."""

from fastapi import APIRouter, Depends

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import SuccessResponse
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=SuccessResponse)
def admin_dashboard(
    db=Depends(get_db),
    current_admin: User = Depends(require_admin),
) -> SuccessResponse:
    """Aggregated application statistics — admin-only (role checked on backend)."""
    stats = AdminService(db).dashboard_stats()
    return SuccessResponse(
        message="Admin dashboard data retrieved",
        data=stats,
    )
