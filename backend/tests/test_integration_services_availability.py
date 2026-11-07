"""Phase 09 integration tests — services / providers / availability + business rules."""

from app.models.user import User, UserRole
from app.core.security import hash_password
from app.repositories.user_repository import UserRepository


def _login_admin(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "Admin12345"},
    )
    return {"Authorization": "Bearer " + resp.json()["data"]["access_token"]}


def _login_customer(client, email="customer9@example.com", password="Custpass1"):
    reg = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Customer 9", "email": email, "password": password},
    )
    if reg.status_code not in (201, 409):
        raise AssertionError(reg.text)
    resp = client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    return {"Authorization": "Bearer " + resp.json()["data"]["access_token"]}


def _admin(db):
    repo = UserRepository(db)
    if not repo.get_by_email("admin@example.com"):
        repo.create_user(
            full_name="Test Admin", email="admin@example.com",
            password_hash=hash_password("Admin12345"), role=UserRole.ADMIN
        )
        db.commit()
    if not repo.get_by_email("customer9@example.com"):
        repo.create_user(
            full_name="Customer 9", email="customer9@example.com",
            password_hash=hash_password("Custpass1"), role=UserRole.CUSTOMER
        )
        db.commit()


def test_service_crud_admin_only(client, db):
    _admin(db)
    ah = _login_admin(client)

    # customers cannot create
    ch = _login_customer(client)
    resp = client.post("/api/v1/services", json={"name": "X", "duration_minutes": 10, "price": 1}, headers=ch)
    assert resp.status_code == 403

    # admin creates
    resp = client.post(
        "/api/v1/services",
        json={"name": "Integration Service", "duration_minutes": 30, "price": 99.0, "description": "d"},
        headers=ah,
    )
    assert resp.status_code == 201
    sid = resp.json()["data"]["id"]

    # Public can list active services
    public = client.get("/api/v1/services").json()["data"]
    assert any(s["id"] == sid for s in public)

    # Admin deactivates then public list hides it
    client.patch(f"/api/v1/services/{sid}/status?is_active=false", headers=ah)
    public2 = client.get("/api/v1/services").json()["data"]
    assert not any(s["id"] == sid for s in public2)
    incl = client.get("/api/v1/services?include_inactive=true", headers=ah).json()["data"]
    assert any(s["id"] == sid for s in incl)


def test_availability_overlap_and_validation(client, db):
    _admin(db)
    ah = _login_admin(client)

    svc = client.post("/api/v1/services", json={"name": "Avail Svc", "duration_minutes": 10, "price": 10}, headers=ah).json()["data"]
    sid = svc["id"]
    pr = client.post("/api/v1/providers", json={"full_name": "Avail Doc"}, headers=ah).json()["data"]
    pid = pr["id"]

    start = "2030-01-10T09:00:00Z"
    end = "2030-01-10T09:30:00Z"
    res1 = client.post("/api/v1/availability", json={"service_id": sid, "provider_id": pid, "start_time": start, "end_time": end, "capacity": 2}, headers=ah)
    assert res1.status_code == 201, res1.text

    # overlapping should be rejected
    res2 = client.post("/api/v1/availability", json={"service_id": sid, "provider_id": pid, "start_time": "2030-01-10T09:15:00Z", "end_time": "2030-01-10T09:45:00Z", "capacity": 2}, headers=ah)
    assert res2.status_code == 409

    # end before start invalid (422 Pydantic validation)
    res3 = client.post("/api/v1/availability", json={"service_id": sid, "provider_id": pid, "start_time": "2030-01-10T09:00:00Z", "end_time": "2030-01-10T08:30:00Z", "capacity": 2}, headers=ah)
    assert res3.status_code == 422

    # past slot rejected (409)
    res4 = client.post("/api/v1/availability", json={"service_id": sid, "provider_id": pid, "start_time": "2020-01-10T09:00:00Z", "end_time": "2020-01-10T09:30:00Z", "capacity": 2}, headers=ah)
    assert res4.status_code == 409


def test_booking_rules_flow(client, db):
    _admin(db)
    ah = _login_admin(client)
    ch = _login_customer(client)

    svc = client.post("/api/v1/services", json={"name": "Booking Svc 2", "duration_minutes": 30, "price": 75}, headers=ah).json()["data"]
    pr = client.post("/api/v1/providers", json={"full_name": "Booking Doc"}, headers=ah).json()["data"]
    start = "2030-02-10T10:00:00Z"
    end = "2030-02-10T10:30:00Z"
    slot = client.post("/api/v1/availability", json={"service_id": svc["id"], "provider_id": pr["id"], "start_time": start, "end_time": end, "capacity": 1}, headers=ah).json()["data"]
    sid = slot["id"]

    # customer books
    b = client.post("/api/v1/bookings", json={"slot_id": sid, "reason": "first"}, headers=ch)
    assert b.status_code == 201
    bid = b.json()["data"]["id"]

    # duplicate same slot by same customer
    dup = client.post("/api/v1/bookings", json={"slot_id": sid, "reason": "dup"}, headers=ch)
    assert dup.status_code == 409

    # past slot (booking for same already 1/1) -> 409 with second customer
    client.post("/api/v1/auth/register", json={"full_name": "Cust3", "email": "cust3@example.com", "password": "Custpass1"})
    c3 = client.post("/api/v1/auth/login", json={"email": "cust3@example.com", "password": "Custpass1"}).json()["data"]["access_token"]
    c3h = {"Authorization": f"Bearer {c3}"}
    overflow = client.post("/api/v1/bookings", json={"slot_id": sid}, headers=c3h)
    assert overflow.status_code == 409

    # ownership: other customer can't view
    forbidden = client.get(f"/api/v1/bookings/{bid}", headers=c3h)
    assert forbidden.status_code == 403

    # cancel (no cutoff invented)
    cancelled = client.patch(f"/api/v1/bookings/{bid}/cancel", headers=ch)
    assert cancelled.status_code == 200
    assert cancelled.json()["data"]["status"] == "cancelled"

    # cancelled can't be cancelled/rescheduled
    once_more = client.patch(f"/api/v1/bookings/{bid}/cancel", headers=ch)
    assert once_more.status_code == 409

    # invalid status transition via admin still (pending/completed)
    # history has 2 events
    hist = client.get(f"/api/v1/bookings/{bid}/history", headers=ch)
    assert hist.status_code == 200
    assert len(hist.json()["data"]) >= 2
    # admin handles all bookings
    ah_all = client.get("/api/v1/admin/bookings", headers=ah)
    assert ah_all.status_code == 200


def test_provider_admin_only(client, db):
    _admin(db)
    ah = _login_admin(client)
    no = client.get("/api/v1/providers?include_inactive=true")
    assert no.status_code == 401 or no.status_code == 403
    ok = client.get("/api/v1/providers?include_inactive=true", headers=ah)
    assert ok.status_code == 200