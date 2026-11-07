"""Aggregated /api/v1 router."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    auth,
    availability,
    bookings,
    dashboard,
    health,
    providers,
    services,
    users,
)

api_v1_router = APIRouter()
api_v1_router.include_router(health.router)
api_v1_router.include_router(auth.router)
api_v1_router.include_router(admin.router)
api_v1_router.include_router(services.router)
api_v1_router.include_router(providers.router)
api_v1_router.include_router(availability.router)
api_v1_router.include_router(users.router)
api_v1_router.include_router(bookings.router)
api_v1_router.include_router(dashboard.router)
