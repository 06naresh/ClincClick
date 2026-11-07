"""Phase 03 authentication and authorization tests (Task 3.7)."""

import datetime

import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository


@pytest.fixture
def admin_user(db):
    """Create an admin account in the isolated test database."""
    repo = UserRepository(db)
    user = repo.create_user(
        full_name="Test Admin",
        email="admin@example.com",
        password_hash=hash_password("Admin12345"),
        role=UserRole.ADMIN,
    )
    db.commit()
    return user


@pytest.fixture
def auth_client(client):
    """Client plus an automatic 1:1 helper; just returns client."""
    return client


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# --- Task: Registration -------------------------------------------------------


def test_register_customer_returns_201(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Reg Customer",
            "email": "reg@example.com",
            "phone": "9876543210",
            "password": "Custpass1",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["data"]["email"] == "reg@example.com"
    assert body["data"]["role"] == "customer"


def test_register_duplicate_email_conflicts(client):
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "One User", "email": "dup@example.com", "password": "Custpass1"},
    )
    response = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Two User", "email": "dup@example.com", "password": "Custpass1"},
    )
    assert response.status_code == 409
    body = response.json()
    assert body["success"] is False


def test_register_invalid_password_returns_422(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Bad User", "email": "bad@example.com", "password": "short"},
    )
    assert response.status_code == 422


def test_register_invalid_email_returns_422(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Bad User", "email": "not-an-email", "password": "Custpass1"},
    )
    assert response.status_code == 422


# --- Task: Login --------------------------------------------------------------


def test_login_success_returns_token(client):
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Login User", "email": "login@example.com", "password": "Custpass1"},
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "Custpass1"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["token_type"] == "bearer"
    assert "access_token" in body["data"]
    assert body["data"]["user"]["email"] == "login@example.com"


def test_login_wrong_password_returns_401(client):
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Wrong User", "email": "wrong@example.com", "password": "Custpass1"},
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "wrong@example.com", "password": "Incorrect1"},
    )
    assert response.status_code == 401
    assert response.json()["success"] is False


def test_login_unknown_email_returns_401(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nope@example.com", "password": "Custpass1"},
    )
    assert response.status_code == 401


# --- Task: Current-user verification (3.5) -----------------------------------


def test_me_requires_authentication(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_with_valid_token_returns_user(client):
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Me", "email": "me@example.com", "password": "Custpass1"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "me@example.com", "password": "Custpass1"},
    )
    token = login.json()["data"]["access_token"]
    response = client.get("/api/v1/auth/me", headers=auth_header(token))
    assert response.status_code == 200
    assert response.json()["data"]["email"] == "me@example.com"
    assert response.json()["data"]["role"] == "customer"


def test_me_invalid_token_returns_401(client):
    response = client.get(
        "/api/v1/auth/me", headers=auth_header("not.a.real.token")
    )
    assert response.status_code == 401


def test_me_expired_token_returns_fresh_error(client):
    now = datetime.datetime.now(datetime.timezone.utc)
    expired = jwt.encode(
        {
            "sub": "999",
            "role": "customer",
            "type": "access",
            "iat": now - datetime.timedelta(hours=2),
            "exp": now - datetime.timedelta(minutes=5),
            "jti": "x",
        },
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    response = client.get("/api/v1/auth/me", headers=auth_header(expired))
    assert response.status_code == 401
    message = response.json()["message"].lower()
    assert "expired" in message or "invalid" in message


# --- Task: RBAC (3.4) ---------------------------------------------------------


def test_customer_cannot_access_admin_dashboard(client):
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Customer User", "email": "cust@example.com", "password": "Custpass1"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "cust@example.com", "password": "Custpass1"},
    )
    token = login.json()["data"]["access_token"]
    response = client.get("/api/v1/admin/dashboard", headers=auth_header(token))
    assert response.status_code == 403


def test_admin_returns_401_without_token(client):
    response = client.get("/api/v1/admin/dashboard")
    assert response.status_code == 401


def test_admin_can_access_admin_dashboard(client, admin_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "Admin12345"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["role"] == "admin"

    token = response.json()["data"]["access_token"]
    response = client.get("/api/v1/admin/dashboard", headers=auth_header(token))
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    totals = body["data"]["totals"]
    assert "users" in totals and "bookings" in totals


# --- Task: Refresh rotation & logout -----------------------------------------


def test_refresh_requires_cookie(client):
    response = client.post("/api/v1/auth/refresh")
    assert response.status_code == 401
    assert "refresh" in response.json()["message"].lower()


def test_refresh_rotates_token_and_issues_new_access(client):
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Rotate User", "email": "rotate@example.com", "password": "Custpass1"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "rotate@example.com", "password": "Custpass1"},
    )
    first_access = login.json()["data"]["access_token"]

    refresh = client.post("/api/v1/auth/refresh")
    assert refresh.status_code == 200
    new_access = refresh.json()["data"]["access_token"]
    assert new_access != first_access
    assert refresh.json()["data"]["user"]["email"] == "rotate@example.com"


def test_logout_returns_success(client):
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Logout User", "email": "logout@example.com", "password": "Custpass1"},
    )
    client.post(
        "/api/v1/auth/login",
        json={"email": "logout@example.com", "password": "Custpass1"},
    )
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json()["success"] is True


# Avoid unused import warnings for TestClient (kept for typing clarity)
_ = TestClient
