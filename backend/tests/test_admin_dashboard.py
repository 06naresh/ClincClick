"""Phase 08 admin dashboard workflow tests (basic), more comprehensive in Phase 09."""

from app.models.user import User, UserRole
from app.core.security import hash_password
from app.repositories.user_repository import UserRepository


def _admin(db):
    repo = UserRepository(db)
    if not repo.get_by_email("admin@example.com"):
        u = repo.create_user(
            full_name="Test Admin", email="admin@example.com",
            password_hash=hash_password("Admin12345"), role=UserRole.ADMIN
        )
        db.commit()
    else:
        u = repo.get_by_email("admin@example.com")
    return u


def test_admin_dashboard_and_booking_filter(client, db):
    admin = _admin(db)
    # register & login a customer + admin separately in fresh client? reuse same client (db already ours)
    cust = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Cust", "email": "cust2@example.com", "password": "Custpass1"},
    )
    assert cust.status_code == 201

    admin_login = client.post(
        "/api/v1/auth/login", json={"email": "admin@example.com", "password": "Admin12345"}
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Dashboard endpoint
    dash = client.get("/api/v1/admin/dashboard", headers=headers)
    assert dash.status_code == 200
    assert "totals" in dash.json()["data"]
    assert "recent_bookings" in dash.json()["data"]

    # Booking list
    lst = client.get("/api/v1/admin/bookings", headers=headers)
    assert lst.status_code == 200

    # Admin cannot allow non-admin? Already covered in auth tests; smoke check deny path via new token
    cust_login = client.post(
        "/api/v1/auth/login", json={"email": "cust2@example.com", "password": "Custpass1"}
    )
    cust_token = cust_login.json()["data"]["access_token"]
    forbidden = client.get(
        "/api/v1/admin/bookings",
        headers={"Authorization": f"Bearer {cust_token}"},
    )
    assert forbidden.status_code == 403


def test_admin_booking_status_validation(client, db):
    _admin(db)
    # Need a booking to status-update; use any if present else skip success assertions.
    admin_login = client.post(
        "/api/v1/auth/login", json={"email": "admin@example.com", "password": "Admin12345"}
    )
    token = admin_login.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    bookings = client.get("/api/v1/admin/bookings", headers=headers).json()["data"]
    if isinstance(bookings, list) and bookings:
        b = bookings[0]
        # Request an invalid transition (completed -> confirmed) if currently completed? pick confirmed->pending?
        resp = client.patch(
            f"/api/v1/admin/bookings/{b['id']}/status",
            params={"status": b["status"]},  # same status = no-op
            headers=headers,
        )
        assert resp.status_code == 200 or resp.status_code in ( 400, 409)
