"""Pytest configuration for backend tests.

Runs against a SEPARATE PostgreSQL database (`service_booking_db_test`) so the
developer's `service_booking_db` is never touched.
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import psycopg
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.core.dependencies import auth_rate_limiter

TEST_DATABASE_NAME = "service_booking_db_test"
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    f"postgresql://postgres:531095@localhost:5432/{TEST_DATABASE_NAME}",
)


def _ensure_test_database() -> None:
    admin_url = TEST_DATABASE_URL.rsplit("/", 1)[0] + "/postgres"
    conn = psycopg.connect(admin_url, autocommit=True)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (TEST_DATABASE_NAME,))
            if cur.fetchone() is None:
                cur.execute(f'CREATE DATABASE "{TEST_DATABASE_NAME}"')
    finally:
        conn.close()


_ensure_test_database()

test_engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)
TestingSessionLocal = sessionmaker(
    bind=test_engine, autocommit=False, autoflush=False, expire_on_commit=False
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
auth_rate_limiter.max_attempts = 10000


@pytest.fixture(scope="session", autouse=True)
def _schema():
    Base.metadata.create_all(test_engine)
    yield
    Base.metadata.drop_all(test_engine)


@pytest.fixture
def db():
    Base.metadata.drop_all(test_engine)
    Base.metadata.create_all(test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    Base.metadata.drop_all(test_engine)
    Base.metadata.create_all(test_engine)
    from fastapi.testclient import TestClient

    with TestClient(app) as c:
        yield c
