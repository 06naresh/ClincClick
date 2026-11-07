"""Aggregated /api/v1 router (Phase 03 wiring)."""

from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, health

api_v1_router = APIRouter()
api_v1_router.include_router(health.router)
api_v1_router.include_router(auth.router)
api_v1_router.include_router(admin.router)
