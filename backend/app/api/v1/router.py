"""Aggregated /api/v1 router.

Each feature area registers its own sub-router here as phases progress:
Phase 03 adds auth/users, Phase 04 services/providers/availability,
Phase 05 bookings/admin.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import health

api_v1_router = APIRouter()
api_v1_router.include_router(health.router)
