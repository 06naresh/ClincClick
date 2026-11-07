# ClincClick — Service Booking Application

A full-stack clinic appointment-booking platform built with **React + Vite (JavaScript)**,
**FastAPI (Python)**, and **PostgreSQL** (managed via pgAdmin 4).

> This project is developed phase by phase following the roadmap in `md_files/phases.md`.

## Project Documentation

- `md_files/architecture.md` — Architecture and folder structure
- `md_files/design.md` — UI/UX design system (GoCliniq-inspired)
- `md_files/phases.md` — Development roadmap (10 phases)
- `md_files/PRD.md` — Functional and non-functional requirements

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (JavaScript) + Vite + Tailwind CSS v4 |
| Routing | React Router DOM |
| HTTP client | Axios |
| Backend | Python + FastAPI + SQLAlchemy + Alembic |
| Database | PostgreSQL (local, via pgAdmin 4) |
| Auth | JWT + Role-Based Access Control |

## Project Status

- [x] **Phase 01 — Project Planning and Environment Setup** (in progress)
- [ ] Phase 02 — Database Design and Backend Foundation
- [ ] Phase 03 — Authentication and Authorization
- [ ] Phase 04 — Service and Availability Management
- [ ] Phase 05 — Booking Management APIs
- [ ] Phase 06 — React Frontend Foundation
- [ ] Phase 07 — Customer Dashboard and Booking UI
- [ ] Phase 08 — Admin Dashboard
- [ ] Phase 09 — Testing, Validation, and Security
- [ ] Phase 10 — Docker, Deployment, and Documentation

## Getting Started (Phase 01)

### 1. Create the database in pgAdmin 4

1. Open **pgAdmin 4** and connect to the local PostgreSQL server.
2. Right-click **Databases → Create → Database**.
3. Name it `service_booking_db`, owner `postgres`, and save.

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # then fill in your real PostgreSQL password
uvicorn app.main:app --reload
```

- API root: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173

## Environment Variables

Copy the `.env.example` files and fill in local values. **Never commit real `.env` files.**

- `backend/.env` — database URL (with your password), JWT secret, token expiry, CORS origin
- `frontend/.env` — backend API base URL

## Run Tests

- Backend: `pytest` (from `backend/`, with venv active)
- Frontend: Vitest + React Testing Library (configured in later phases)
