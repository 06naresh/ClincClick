"""Health endpoint tests (Phase 02)."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_returns_success():
    response = client.get("/")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True


def test_api_v1_health_returns_success():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert "healthy" in body["message"]


def test_api_v1_health_db_connects():
    """Requires the configured PostgreSQL database to be reachable."""
    response = client.get("/api/v1/health/db")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["database"] == "connected"


def test_unknown_endpoint_uses_error_envelope():
    response = client.get("/api/v1/definitely-not-here")
    assert response.status_code == 404
    body = response.json()
    assert body["success"] is False
    assert "message" in body
