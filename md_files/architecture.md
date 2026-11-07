# Service Booking Application – System Architecture

## 1. Project Overview

The Service Booking Application is a full-stack clinic appointment-booking platform that allows customers to register, authenticate, explore clinic services, view available appointment slots, book appointments, reschedule appointments, cancel appointments, and view their booking history.

The application also provides an administrator dashboard through which administrators can manage clinic services, appointment availability, customers' bookings, and booking statuses.

The application will be developed using a modular architecture with separate frontend, backend, and database layers.

### Primary Objectives

- Provide a simple and responsive appointment-booking experience.
- Allow customers to manage their own appointments.
- Allow administrators to manage services, availability, and bookings.
- Prevent unauthorized access through authentication and role-based authorization.
- Prevent duplicate and conflicting appointment bookings.
- Maintain a reliable booking history.
- Follow clean code, modular development, and maintainable architecture principles.

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Purpose |
|---|---|
| React | Component-based UI development |
| JavaScript (ES6+) | Frontend programming language |
| Vite | Development server and build tool |
| Tailwind CSS | Styling and responsive layouts |
| React Router DOM | Client-side routing |
| Axios | HTTP communication with backend |
| React Context API | Authentication and shared application state |
| React Hook Form | Form management |
| Zod | Client-side validation |
| Lucide React | Application icons |
| React Toastify or Sonner | Notifications and feedback |
| date-fns | Date and time formatting |

Frontend must use JavaScript, not TypeScript.

### 2.2 Backend

| Technology | Purpose |
|---|---|
| Python | Backend programming language |
| FastAPI | REST API framework |
| Pydantic | Request and response validation |
| SQLAlchemy | ORM and database operations |
| Alembic | Database migrations |
| PostgreSQL | Relational database |
| python-jose or PyJWT | JWT handling |
| pwdlib with Argon2 | Password hashing |
| pydantic-settings | Environment configuration |
| Uvicorn | ASGI application server |
| Email-validator | Email validation |

Use compatible, stable dependency versions. Pin dependencies in the project's dependency files.

### 2.3 Testing

| Technology | Purpose |
|---|---|
| Pytest | Backend unit testing |
| HTTPX | API integration testing |
| pytest-cov | Backend test coverage |
| Vitest | Frontend unit testing |
| React Testing Library | React component testing |
| Playwright | End-to-end browser testing |

### 2.4 Development and Deployment

| Technology | Purpose |
|---|---|
| Git | Version control |
| GitHub | Source code repository |
| pgAdmin 4 | PostgreSQL database management |
| Docker | Application containerization |
| Docker Compose | Local multi-service orchestration |
| Swagger UI | Interactive API documentation |

---

## 3. High-Level System Architecture

The application follows a three-layer architecture:

1. Presentation Layer – React frontend.
2. Application Layer – FastAPI backend.
3. Data Layer – PostgreSQL database.

### Architecture Flow

```text
                 CUSTOMER / ADMIN
                         |
                         |
                         v
               REACT FRONTEND
                 (Vite + JS)
                         |
                         |
                 Axios HTTP Client
                         |
                         v
                 FASTAPI BACKEND
                         |
              ---------------------
              |         |         |
              v         v         v
            API      SERVICES   SECURITY
          ROUTERS    LAYER      LAYER
              |         |         |
              ---------|----------
                        |
                        v
                 REPOSITORIES
                        |
                        v
                   SQLALCHEMY
                        |
                        v
                   POSTGRESQL
                        |
                        v
                     pgAdmin
                 (Management Tool)
```

### Communication Flow

1. A customer interacts with the React application.
2. React sends an HTTP request using Axios.
3. FastAPI receives the request through the appropriate API router.
4. Authentication and authorization dependencies verify the request.
5. Pydantic validates the request data.
6. The service layer executes the business logic.
7. The repository layer performs database operations.
8. SQLAlchemy communicates with PostgreSQL.
9. FastAPI returns a JSON response.
10. React updates the user interface.

All frontend-to-backend communication must happen through documented REST APIs.

The frontend must never connect directly to PostgreSQL.

---

## 4. Project Folder Structure

Use the following folder structure as the architectural reference.

```text
service-booking-app/
│
├── md_files/
│   ├── architecture.md
│   ├── design.md
│   ├── phases.md
│   └── PRD.md
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.jsx
│   │   │   ├── router.jsx
│   │   │   └── providers.jsx
│   │   │
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   ├── services/
│   │   │   │   └── hooks/
│   │   │   │
│   │   │   ├── appointments/
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   ├── services/
│   │   │   │   └── hooks/
│   │   │   │
│   │   │   ├── availability/
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   └── services/
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   └── services/
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── components/
│   │   │   │   └── pages/
│   │   │   │
│   │   │   └── profile/
│   │   │       ├── components/
│   │   │       └── pages/
│   │   │
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── tests/
│   │
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── router.py
│   │   │       └── endpoints/
│   │   │           ├── auth.py
│   │   │           ├── users.py
│   │   │           ├── services.py
│   │   │           ├── providers.py
│   │   │           ├── availability.py
│   │   │           ├── bookings.py
│   │   │           └── admin.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── dependencies.py
│   │   │   └── exceptions.py
│   │   │
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── init_db.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── service.py
│   │   │   ├── provider.py
│   │   │   ├── availability_slot.py
│   │   │   ├── booking.py
│   │   │   ├── booking_history.py
│   │   │   └── refresh_token.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── service.py
│   │   │   ├── provider.py
│   │   │   ├── availability.py
│   │   │   ├── booking.py
│   │   │   └── common.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── service_service.py
│   │   │   ├── availability_service.py
│   │   │   ├── booking_service.py
│   │   │   └── admin_service.py
│   │   │
│   │   ├── repositories/
│   │   │   ├── user_repository.py
│   │   │   ├── service_repository.py
│   │   │   ├── provider_repository.py
│   │   │   ├── availability_repository.py
│   │   │   └── booking_repository.py
│   │   │
│   │   └── utils/
│   │       ├── datetime_utils.py
│   │       └── response_utils.py
│   │
│   ├── alembic/
│   │   └── versions/
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   ├── conftest.py
│   │   └── test_health.py
│   │
│   ├── .env.example
│   ├── alembic.ini
│   └── requirements.txt
│
├── database/
│   ├── init/
│   ├── seeds/
│   └── scripts/
│
├── docs/
│   ├── api/
│   ├── database/
│   ├── testing/
│   └── deployment/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── .opencoderules
└── README.md
```

Folders and files must be created progressively according to the development phases. Do not generate every file before its implementation phase.

---

## 5. PostgreSQL Database Architecture

### 5.1 Database Configuration

The project must use the PostgreSQL server installed locally on the developer's machine.

pgAdmin 4 will be used to manage the PostgreSQL server and database.

**Database details:**

| Property | Value |
|---|---|
| Database name | service_booking_db |
| Database engine | PostgreSQL |
| Host | localhost |
| Port | 5432 |
| Username | postgres |
| Database management | pgAdmin 4 |
| ORM | SQLAlchemy |
| Migration tool | Alembic |

**Database connection template:**

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/service_booking_db
```

Replace YOUR_PASSWORD with the actual local PostgreSQL password.

Never hardcode database credentials in Python files.

Never commit `.env` files or database passwords to GitHub.

Use `.env.example` to document required environment variables without including actual secrets.

### 5.2 Creating the Database

The developer will manually create the following database using pgAdmin 4:

```text
service_booking_db
```

Steps:

1. Open pgAdmin 4.
2. Connect to the local PostgreSQL server.
3. Expand Servers.
4. Expand the PostgreSQL server.
5. Right-click Databases.
6. Select Create > Database.
7. Enter service_booking_db.
8. Select postgres as the owner.
9. Save.

The backend will connect to this database using SQLAlchemy.

Alembic will create and maintain the database tables through migrations.

Do not use SQLite as the primary application database.

Do not replace the local PostgreSQL setup with a cloud database unless explicitly approved by the project owner.

### 5.3 Database Tables

The application will initially contain the following tables.

#### A. users

Stores customer and administrator accounts.

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| full_name | String | User's full name |
| email | String | Unique email |
| password_hash | String | Hashed password |
| phone | String | Contact number |
| role | Enum/String | customer or admin |
| is_active | Boolean | Account status |
| created_at | Timestamp | Account creation |
| updated_at | Timestamp | Last update |

#### B. services

Stores the services offered by the clinic.

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| name | String | Service name |
| description | Text | Service details |
| duration_minutes | Integer | Appointment duration |
| price | Numeric | Service price |
| is_active | Boolean | Service availability |
| created_at | Timestamp | Creation date |

#### C. providers

Stores doctors or service providers.

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| full_name | String | Provider name |
| specialization | String | Professional specialization |
| bio | Text | Provider description |
| is_active | Boolean | Provider status |
| created_at | Timestamp | Creation date |

#### D. availability_slots

Stores appointment availability.

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| service_id | Integer | Foreign key |
| provider_id | Integer | Foreign key |
| start_time | Timestamp | Slot start |
| end_time | Timestamp | Slot end |
| capacity | Integer | Maximum bookings |
| is_active | Boolean | Availability status |
| created_at | Timestamp | Creation date |

#### E. bookings

Stores customer appointments.

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| booking_reference | String | Unique reference |
| user_id | Integer | Customer foreign key |
| slot_id | Integer | Availability slot foreign key |
| status | Enum/String | Booking status |
| reason | Text | Appointment reason |
| created_at | Timestamp | Booking date |
| updated_at | Timestamp | Last modification |

Initial booking statuses:

- Pending
- Confirmed
- Cancelled
- Completed

#### F. booking_history

Maintains the history of booking changes.

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| booking_id | Integer | Booking foreign key |
| old_status | String | Previous status |
| new_status | String | New status |
| changed_by | Integer | User who performed action |
| change_reason | Text | Reason for change |
| changed_at | Timestamp | Change timestamp |

Rescheduling must also be recorded in the booking history, including the previous and new slot references.

#### G. refresh_tokens

Stores refresh-token session information when implementing the refresh-token mechanism.

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| user_id | Integer | User foreign key |
| token_hash | String | Hashed refresh token |
| expires_at | Timestamp | Expiry time |
| revoked_at | Timestamp | Revocation time |
| created_at | Timestamp | Creation time |

### 5.4 Database Relationships

- One user can create multiple bookings.
- One service can have multiple availability slots.
- One provider can have multiple availability slots.
- One availability slot can have multiple bookings up to its capacity.
- One booking can have multiple history records.
- One user can have multiple refresh-token records.

Use proper foreign keys, indexes, unique constraints, and database-level integrity rules.

Use appropriate deletion behavior. Avoid deleting historical bookings or users in a way that destroys important audit information.

---

## 6. Backend Architecture

The backend must follow a layered architecture.

### 6.1 API Layer

Location:

```text
backend/app/api/v1/endpoints/
```

Responsibilities:

- Receive HTTP requests.
- Validate request data through Pydantic schemas.
- Apply authentication and authorization dependencies.
- Call the appropriate service methods.
- Return standardized API responses.

API endpoints must not contain complex business logic or direct database queries.

### 6.2 Service Layer

Location:

```text
backend/app/services/
```

Responsibilities:

- Implement business rules.
- Validate appointment workflows.
- Coordinate repository operations.
- Handle booking creation and rescheduling.
- Enforce booking restrictions.
- Handle application-level exceptions.

Example:

```text
booking_service.py
    |
    ├── create_booking()
    ├── get_booking()
    ├── get_customer_bookings()
    ├── reschedule_booking()
    └── cancel_booking()
```

### 6.3 Repository Layer

Location:

```text
backend/app/repositories/
```

Responsibilities:

- Perform database queries.
- Retrieve records.
- Create and update database objects.
- Handle database persistence.
- Keep SQLAlchemy query logic separate from business rules.

### 6.4 Models Layer

Location:

```text
backend/app/models/
```

Contains SQLAlchemy ORM models representing database tables and relationships.

### 6.5 Schemas Layer

Location:

```text
backend/app/schemas/
```

Contains Pydantic request and response schemas.

Examples:

- UserCreate
- UserLogin
- UserResponse
- ServiceCreate
- ServiceResponse
- BookingCreate
- BookingResponse
- BookingReschedule

Do not expose password hashes or internal security information in API responses.

### 6.6 Core Layer

Location:

```text
backend/app/core/
```

Contains:

- Application settings.
- Security utilities.
- Authentication dependencies.
- Authorization dependencies.
- Exception handling.
- Shared configuration.

---

## 7. Frontend Architecture

The frontend must use a feature-based architecture.

Each feature should contain its own components, pages, hooks, and API service functions where appropriate.

### 7.1 App Layer

Responsible for:

- Application initialization.
- Router configuration.
- Global providers.
- Shared authentication context.

### 7.2 Features

#### Authentication

Includes:

- Registration.
- Login.
- Logout.
- Token/session handling.
- Authentication guards.

#### Services

Includes:

- Service listing.
- Service details.
- Service filtering.

#### Availability

Includes:

- Appointment calendar.
- Date selection.
- Available slots.
- Provider selection.

#### Appointments

Includes:

- Booking creation.
- Booking confirmation.
- Booking rescheduling.
- Booking cancellation.
- Booking history.

#### Dashboard

Includes:

- Customer dashboard.
- Admin dashboard.
- Appointment summaries.
- Dashboard statistics.

#### Profile

Includes:

- User profile.
- Account details.
- Profile updates.

### 7.3 Shared Components

Reusable UI components should be placed in:

```text
frontend/src/components/
```

Examples:

- Button
- Input
- Select
- Modal
- Card
- Badge
- Table
- Loader
- EmptyState
- ConfirmDialog
- Navbar
- Sidebar
- ProtectedRoute

Avoid duplicating common UI functionality across features.

---

## 8. Authentication and Authorization Architecture

The application must use JWT-based authentication and role-based access control.

### 8.1 User Roles

Two roles are required initially.

**Customer**

- Register an account.
- Log in.
- View active services.
- View available appointment slots.
- Create bookings.
- View their own bookings.
- Reschedule eligible bookings.
- Cancel eligible bookings.
- View their booking history.
- Update their own profile.

**Admin**

- Log in.
- Access the admin dashboard.
- Create and update services.
- Manage providers.
- Create and manage availability slots.
- View all bookings.
- Manage booking statuses.
- View booking statistics.

Public registration must always create a customer account.

Customers must never be allowed to assign themselves the admin role through registration or profile updates.

Admin accounts must be created through a secure administrative setup process.

### 8.2 JWT Authentication Flow

```text
User
 |
 v
Login Form
 |
 v
FastAPI Authentication API
 |
 v
Verify Email and Password
 |
 v
Generate JWT Access Token
 |
 v
Return Authentication Response
 |
 v
Frontend Maintains Session
 |
 v
Protected API Requests
 |
 v
Verify JWT
 |
 v
Check User Role and Permissions
 |
 v
Allow or Reject Request
```

### 8.3 Security Requirements

- Hash passwords using Argon2.
- Never store plain-text passwords.
- Validate JWT signatures and expiration.
- Use short-lived access tokens.
- Implement refresh-token rotation and revocation.
- Store refresh tokens securely.
- Prefer HTTP-only, Secure, SameSite cookies for refresh-token storage.
- Never expose refresh tokens to JavaScript.
- Protect admin-only endpoints.
- Validate resource ownership on customer endpoints.
- Never trust the user ID or role supplied by the frontend.
- Implement proper CORS configuration.
- Never expose secrets in API responses or logs.

The access-token delivery strategy must be documented and consistently implemented across frontend and backend.

---

## 9. Booking Business Logic

Booking management is the central feature of this application.

### 9.1 Creating a Booking

1. Customer logs in.
2. Customer selects a service.
3. Customer selects a provider if applicable.
4. Customer selects an available date and slot.
5. Customer submits the booking request.
6. Backend validates the service and slot.
7. Backend checks the slot's availability and capacity.
8. Backend creates the booking inside a database transaction.
9. Backend records the initial booking history.
10. Backend returns the booking confirmation.

### 9.2 Preventing Double Booking

The backend must prevent concurrent booking requests from exceeding the slot capacity.

Use:

- Database transactions.
- Appropriate row-level locking, such as SELECT FOR UPDATE.
- Capacity validation inside the transaction.
- Database constraints where appropriate.

Do not rely only on frontend validation.

For a single-capacity appointment, only one active booking can occupy that slot.

### 9.3 Rescheduling

1. Customer requests a new slot.
2. Backend verifies booking ownership.
3. Backend verifies that rescheduling is permitted.
4. Backend locks and validates the target slot.
5. Backend updates the booking atomically.
6. Backend records the previous and new slot in booking history.

If any operation fails, the transaction must roll back.

### 9.4 Cancellation

1. Customer requests cancellation.
2. Backend verifies ownership and booking status.
3. Backend checks cancellation eligibility.
4. Backend changes the status to Cancelled.
5. Backend records the change in booking history.
6. The cancelled booking must no longer consume active slot capacity.

### 9.5 Booking Rules

- Customers can only access their own bookings.
- Admins can access all bookings.
- Cancelled bookings cannot be rescheduled.
- Completed bookings cannot be cancelled or rescheduled.
- Past slots cannot be booked.
- Inactive services cannot be booked.
- Inactive providers cannot receive new bookings.
- Booking status transitions must be validated.
- Booking history must be preserved.

The exact cancellation and rescheduling deadlines must be configurable rather than hardcoded.

---

## 10. REST API Architecture

All APIs must use versioning.

Base URL:

```text
/api/v1
```

### Authentication APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/register | Register customer |
| POST | /auth/login | Login |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout |
| GET | /auth/me | Current user |

### User APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /users/me | Get profile |
| PATCH | /users/me | Update profile |

### Service APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /services | List active services |
| GET | /services/{id} | Service details |
| POST | /services | Create service (admin) |
| PATCH | /services/{id} | Update service (admin) |
| DELETE | /services/{id} | Deactivate service (admin) |

### Provider APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /providers | List providers |
| GET | /providers/{id} | Provider details |
| POST | /providers | Create provider (admin) |
| PATCH | /providers/{id} | Update provider (admin) |

### Availability APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /availability | Get available slots |
| GET | /availability/{id} | Get slot details |
| POST | /availability | Create slot (admin) |
| PATCH | /availability/{id} | Update slot (admin) |
| DELETE | /availability/{id} | Deactivate slot (admin) |

### Booking APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /bookings | Create booking |
| GET | /bookings/my | Get customer's bookings |
| GET | /bookings/{id} | Get booking details |
| PATCH | /bookings/{id}/reschedule | Reschedule booking |
| PATCH | /bookings/{id}/cancel | Cancel booking |
| GET | /bookings/{id}/history | Get booking history |

### Admin APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /admin/dashboard | Dashboard statistics |
| GET | /admin/bookings | View all bookings |
| PATCH | /admin/bookings/{id}/status | Update booking status |

All endpoints must enforce the appropriate authentication, authorization, validation, and ownership rules.

Use proper HTTP status codes and consistent error responses.

---

## 11. API Response Standards

Use JSON responses consistently.

### Successful Response

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "booking_reference": "BK-20261107-0001",
    "status": "Confirmed"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "The selected slot is no longer available",
  "errors": []
}
```

Use appropriate HTTP status codes:

- 200 – Successful request.
- 201 – Resource created.
- 204 – Successful deletion with no response body.
- 400 – Invalid business operation.
- 401 – Unauthenticated.
- 403 – Insufficient permissions.
- 404 – Resource not found.
- 409 – Resource conflict, such as a full slot.
- 422 – Request validation failure.
- 500 – Unexpected server error.

Do not return HTTP 200 for failed operations.

---

## 12. Environment Configuration

### Backend .env

Example:

```env
APP_NAME=Service Booking API
APP_ENV=development
DEBUG=True

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/service_booking_db

SECRET_KEY=CHANGE_THIS_TO_A_SECURE_RANDOM_SECRET
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

FRONTEND_URL=http://localhost:5173
```

### Frontend .env

Example:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Frontend environment variables must never contain private secrets.

Never commit real `.env` files.

---

## 13. Database Migration Strategy

Alembic must manage database schema changes.

Development workflow:

```text
Modify SQLAlchemy Model
          |
          v
Generate Alembic Migration
          |
          v
Review Migration File
          |
          v
Apply Migration
          |
          v
Verify Changes in pgAdmin
```

Common commands:

```bash
alembic revision --autogenerate -m "create initial tables"
```

```bash
alembic upgrade head
```

```bash
alembic downgrade -1
```

Do not manually create application tables in pgAdmin.

Do not edit the database schema directly without recording the change in Alembic migrations.

---

## 14. Error Handling and Logging

The backend must implement centralized exception handling.

Requirements:

- Use appropriate HTTP exceptions.
- Handle database errors.
- Handle validation failures.
- Handle authentication failures.
- Handle unavailable booking slots.
- Log unexpected server errors.
- Avoid exposing stack traces or secrets to clients.
- Include useful error messages for frontend handling.

The frontend must display user-friendly error messages and must not expose raw backend stack traces.

---

## 15. Security Architecture

Security must be implemented throughout development, not postponed until deployment.

Required protections:

1. Password hashing.
2. JWT signature and expiry validation.
3. Refresh-token rotation and revocation.
4. Role-based authorization.
5. Resource ownership validation.
6. Input validation.
7. SQL injection protection through parameterized ORM queries.
8. CORS restrictions.
9. Secure cookie configuration.
10. Environment-based secret management.
11. Rate limiting for authentication endpoints.
12. Protection against appointment overbooking.
13. Safe error handling.
14. Audit history for booking changes.

---

## 16. Testing Architecture

### Backend Testing

Use Pytest.

Test:

- Customer registration.
- Login and authentication.
- Password validation.
- Admin authorization.
- Service CRUD.
- Provider CRUD.
- Availability CRUD.
- Booking creation.
- Booking cancellation.
- Booking rescheduling.
- Booking history.
- Slot capacity and concurrent booking requests.
- Unauthorized resource access.

Use a separate test database. Never run destructive tests against the developer's main database.

### Frontend Testing

Use Vitest and React Testing Library.

Test:

- Form validation.
- Login and registration.
- Route protection.
- Service listing.
- Calendar and slot selection.
- Booking forms.
- Appointment status rendering.
- Error handling.
- Responsive navigation.

### End-to-End Testing

Use Playwright.

Test complete workflows:

- Customer registration and login.
- Booking an appointment.
- Viewing booking history.
- Rescheduling an appointment.
- Cancelling an appointment.
- Admin login.
- Admin service management.
- Admin availability management.
- Admin booking management.

---

## 17. UI Architecture Reference

The visual design must use the following website as its primary inspiration:

https://gocliniq.in/

The application should follow a modern healthcare SaaS design direction.

Required design characteristics:

- Clean and professional clinic interface.
- White and light-grey backgrounds.
- Blue and periwinkle primary color palette.
- Soft lavender and light-blue secondary colors.
- Subtle shadows and rounded cards.
- Clear visual hierarchy.
- Consistent typography.
- Simple sidebar navigation.
- Appointment calendar and schedule views.
- Modern dashboard statistics.
- Accessible forms and controls.
- Responsive layouts for desktop, tablet, and mobile.

Do not copy GoCliniq's source code, logo, proprietary assets, or branding.

Refer to `design.md` for the complete visual design system.

---

## 18. Architectural Coding Standards

### Python

- Follow PEP 8.
- Use meaningful function and variable names.
- Use modular Python files.
- Add type hints.
- Use dependency injection.
- Keep business logic in the service layer.
- Keep database operations in the repository layer.
- Avoid unnecessary global state.
- Use reusable exceptions and utilities.

### React

- Use JavaScript only.
- Use functional components.
- Use React hooks.
- Use reusable components.
- Keep feature-specific code inside feature folders.
- Separate API calls from presentation components.
- Avoid unnecessary prop drilling.
- Use Context API only for suitable shared state.
- Use controlled forms and validation.
- Avoid large components with multiple responsibilities.

### Database

- Use normalized relational structures.
- Define foreign keys.
- Add appropriate indexes.
- Enforce unique constraints.
- Use transactions for critical booking operations.
- Use Alembic for schema changes.
- Preserve booking history.

---

## 19. Architecture Rules for AI Assistant

The AI coding assistant must follow these rules:

1. Read this architecture document before generating or modifying application code.
2. Read `PRD.md` before implementing features.
3. Follow `phases.md` and implement phases in their specified order.
4. Follow `design.md` for all frontend design decisions.
5. Maintain the established folder structure.
6. Do not introduce TypeScript.
7. Do not replace PostgreSQL with SQLite or another database.
8. Use the locally installed PostgreSQL server and pgAdmin 4 management workflow.
9. Never hardcode database passwords, JWT secrets, or other credentials.
10. Do not put business logic inside API routers.
11. Do not put database queries directly inside React components.
12. Do not bypass authentication or authorization.
13. Do not trust frontend-provided user roles or ownership information.
14. Use database transactions for booking-critical operations.
15. Maintain backward compatibility where possible.
16. Do not delete existing working functionality while implementing new features.
17. Do not create unnecessary duplicate components or utility files.
18. Follow the project's testing requirements.
19. Update documentation when architectural decisions change.
20. Ask for approval before making major architectural changes.

---

## 20. Definition of Architectural Completion

The architecture is considered successfully implemented when:

- React frontend and FastAPI backend communicate successfully.
- PostgreSQL connects through the local pgAdmin-managed server.
- SQLAlchemy models represent the database structure.
- Alembic manages database migrations.
- API routers, services, repositories, schemas, and models are properly separated.
- JWT authentication works.
- Customer and admin permissions are enforced.
- Booking operations are transaction-safe.
- The project follows the established folder structure.
- Backend and frontend testing infrastructure is configured.
- The application follows the GoCliniq-inspired design direction.

---

**End of architecture.md**