# Service Booking Application — Development Phases

## 1. Purpose of This Document

This document defines the step-by-step development roadmap for the Service Booking Application.

The project must be developed phase by phase. Each phase introduces specific concepts, implementation tasks, expected deliverables, and completion criteria.

The AI coding assistant must follow this roadmap instead of generating the entire application at once.

### Project Objective

Build a responsive appointment-booking application for a clinic or service center.

Customers should be able to:

- Register and log in.
- Browse available services.
- View providers and available appointment slots.
- Book appointments.
- Reschedule appointments.
- Cancel appointments.
- View their booking history.
- Manage their profile.

Administrators should be able to:

- Log in using an administrator account.
- Manage services.
- Manage providers.
- Create and manage availability slots.
- View and manage all bookings.
- Update booking statuses.
- Monitor appointment activity.

---

# 2. Technology Stack

The following technologies must be used throughout the project.

| Area | Technology |
|---|---|
| Frontend | React with JavaScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| HTTP requests | Axios |
| Frontend state | React Context API and hooks |
| Backend | Python and FastAPI |
| Database | PostgreSQL |
| Database management | pgAdmin 4 |
| ORM | SQLAlchemy |
| Database migrations | Alembic |
| Validation | Pydantic |
| Authentication | JWT |
| Authorization | Role-Based Access Control |
| Backend testing | Pytest and HTTPX |
| Frontend testing | Vitest and React Testing Library |
| End-to-end testing | Playwright |
| API documentation | FastAPI Swagger UI |
| Containerization | Docker and Docker Compose |
| Version control | Git and GitHub |

**Important technology rules:**

- Use JavaScript for React. Do not use TypeScript.
- Use PostgreSQL as the primary database.
- Do not replace PostgreSQL with SQLite.
- Use SQLAlchemy for database operations.
- Use Alembic for database schema migrations.
- Do not hardcode database passwords, JWT secrets, or other credentials.
- Keep the frontend and backend independently organized.

---

# 3. Development Workflow

Follow this workflow for every phase:

1. Understand the phase requirements.
2. Identify the concepts that need to be learned.
3. Review the existing project structure.
4. Create only the folders and files required for the current phase.
5. Implement the functionality step by step.
6. Explain important code and architectural decisions.
7. Run the application and test the implementation.
8. Fix errors before proceeding.
9. Update the README or relevant documentation when necessary.
10. Confirm that the phase completion criteria are satisfied.

The AI assistant must not skip unfinished tasks or silently move to the next phase.

---

# 4. Phase 01 — Project Planning and Environment Setup

## Objective

Prepare the development environment and establish the project structure before implementing application functionality.

## Concepts to Learn

- Full-stack application architecture.
- Client-server communication.
- React and Vite fundamentals.
- FastAPI fundamentals.
- PostgreSQL basics.
- Git and GitHub workflow.
- Environment variables.
- Frontend/backend separation.
- REST API fundamentals.

## Tasks

### Task 1.1 — Create the project

Create the root project directory:

`service-booking-app`

Create the main folders:

- `frontend/`
- `backend/`
- `database/`
- `docs/`
- `ai-assistant/`

### Task 1.2 — Set up the React frontend

Inside `frontend/`:

- Create a React application using Vite.
- Use JavaScript.
- Install and configure Tailwind CSS.
- Install React Router.
- Install Axios.
- Install Lucide React for icons.
- Create the initial feature-based folder structure.

### Task 1.3 — Set up the FastAPI backend

Inside `backend/`:

- Create a Python virtual environment.
- Install FastAPI and Uvicorn.
- Install SQLAlchemy.
- Install Alembic.
- Install Psycopg.
- Install Pydantic settings support.
- Install authentication and password-hashing dependencies.
- Install Pytest and HTTPX.

### Task 1.4 — Configure PostgreSQL

Use the PostgreSQL installation already available on the local machine.

Open pgAdmin 4 and create a database named:

`service_booking_db`

Connection configuration:

- Host: `localhost`
- Port: `5432`
- Username: `postgres`
- Database: `service_booking_db`

Use this connection URL as a template:

`postgresql://postgres:531095@localhost:5432/service_booking_db`

Do not commit the actual password to GitHub.

### Task 1.5 — Configure environment variables

Create:

- `frontend/.env.example`
- `backend/.env.example`
- Root `.env.example` if shared configuration is needed.

Frontend configuration should include the backend API base URL.

Backend configuration should include:

- Application settings.
- Database connection URL.
- JWT secret.
- JWT algorithm.
- Access-token expiration.
- CORS allowed origins.

Keep real secrets in local `.env` files and add those files to `.gitignore`.

### Task 1.6 — Initial application verification

- Run the React frontend.
- Run the FastAPI backend.
- Verify the FastAPI health endpoint.
- Verify that Swagger UI is accessible.
- Verify PostgreSQL connectivity from the backend.

## Expected Deliverables

- Working React development environment.
- Working FastAPI development environment.
- PostgreSQL database created through pgAdmin 4.
- Environment configuration templates.
- Initial project folder structure.
- Git repository initialized.

## Completion Criteria

- [ ] React application starts successfully.
- [ ] FastAPI application starts successfully.
- [ ] PostgreSQL connection works.
- [ ] Swagger UI opens.
- [ ] Environment variables are configured.
- [ ] Sensitive files are excluded from Git.

---

# 5. Phase 02 — Database Design and Backend Foundation

## Objective

Design the database and build the foundational backend architecture.

## Concepts to Learn

- Relational database design.
- Primary keys and foreign keys.
- One-to-many and many-to-one relationships.
- SQL constraints.
- SQLAlchemy models.
- Database sessions.
- Repository pattern.
- Service layer.
- Alembic migrations.
- Pydantic schemas.
- Dependency injection in FastAPI.

## Tasks

### Task 2.1 — Design the database schema

Create the initial database design.

Suggested tables:

1. `users`
2. `services`
3. `providers`
4. `availability_slots`
5. `bookings`
6. `booking_history`
7. `refresh_tokens` (only if refresh-token functionality is implemented).

Define:

- Primary keys.
- Foreign keys.
- Unique constraints.
- Required and optional columns.
- Default values.
- Created and updated timestamps.
- Appropriate indexes.

### Task 2.2 — Define relationships

Examples:

- One user can have many bookings.
- One service can have many availability slots.
- One provider can have many availability slots.
- One availability slot can be associated with bookings according to its capacity.
- One booking can have multiple booking-history records.

Make sure the relationships are reflected correctly in SQLAlchemy.

### Task 2.3 — Configure SQLAlchemy

Create:

- Database configuration.
- Database engine.
- Session factory.
- Database dependency.
- SQLAlchemy declarative base.

Use a database session dependency in FastAPI endpoints.

### Task 2.4 — Create SQLAlchemy models

Create separate model files for the database entities.

Do not place every model in one large file.

### Task 2.5 — Create Pydantic schemas

Create schemas for:

- User.
- Service.
- Provider.
- Availability slot.
- Booking.
- Booking history.

Separate request schemas from response schemas where appropriate.

### Task 2.6 — Configure Alembic

- Initialize Alembic.
- Connect Alembic to application database settings.
- Configure model metadata.
- Generate the initial migration.
- Review the generated migration.
- Apply the migration to PostgreSQL.
- Verify the created tables in pgAdmin 4.

### Task 2.7 — Establish backend architecture

Implement the backend layers:

- API routes.
- Service layer.
- Repository layer.
- Database models.
- Pydantic schemas.
- Core configuration.
- Shared utilities.

Each layer must have a clear responsibility.

### Task 2.8 — Create a health endpoint

Create an endpoint such as:

`GET /api/v1/health`

It should return a successful response when the API is running.

If appropriate, add a database health check separately.

## Expected Deliverables

- Initial PostgreSQL schema.
- SQLAlchemy models.
- Pydantic schemas.
- Database connection configuration.
- Alembic configuration and initial migration.
- Backend layered architecture.
- Health endpoint.

## Completion Criteria

- [ ] All initial tables are created.
- [ ] Foreign-key relationships work.
- [ ] Alembic migration runs successfully.
- [ ] SQLAlchemy connects to PostgreSQL.
- [ ] Pydantic schemas validate sample data.
- [ ] Health endpoint works.
- [ ] No database credentials are hardcoded.

---

# 6. Phase 03 — Authentication and Authorization

## Objective

Implement secure registration, login, authentication, and role-based access control.

## Concepts to Learn

- Authentication versus authorization.
- Password hashing.
- JWT access tokens.
- JWT token validation.
- OAuth2 password bearer.
- FastAPI dependencies.
- Role-Based Access Control.
- Protected routes.
- Token expiration.
- Authentication error handling.

## Tasks

### Task 3.1 — User registration

Create:

`POST /api/v1/auth/register`

Requirements:

- Accept name, email, and password.
- Validate required fields.
- Validate email format.
- Check for duplicate email addresses.
- Hash passwords before storing them.
- Never store plain-text passwords.
- Assign the customer role by default.
- Return an appropriate response.

### Task 3.2 — User login

Create:

`POST /api/v1/auth/login`

Requirements:

- Accept email and password.
- Verify the user exists.
- Verify the password hash.
- Generate a JWT access token.
- Return the token and necessary user information.

### Task 3.3 — Authentication dependency

Create a reusable authentication dependency.

It must:

- Read the bearer token.
- Validate the token.
- Verify its expiration.
- Retrieve the authenticated user.
- Reject invalid or expired tokens.

### Task 3.4 — Role-based access control

Implement at least two roles:

- `customer`
- `admin`

Requirements:

- Customers can access their own account and bookings.
- Administrators can access administrative functionality.
- Customers must not access admin-only endpoints.
- Do not trust a role supplied by the frontend.
- Always verify authorization on the backend.

### Task 3.5 — Current-user endpoint

Create:

`GET /api/v1/auth/me`

Return the currently authenticated user's information.

### Task 3.6 — Frontend authentication

Create:

- Registration page.
- Login page.
- Authentication context.
- Authentication hooks.
- Protected routes.
- Admin-only route protection.
- Logout functionality.

Use a secure token-handling strategy. Prefer HTTP-only secure cookies when the backend and frontend deployment architecture support them. If bearer tokens are used in client-side storage, document the security trade-offs and do not treat local storage as inherently secure.

### Task 3.7 — Authentication testing

Test:

- Successful registration.
- Duplicate email registration.
- Successful login.
- Incorrect password.
- Invalid token.
- Expired token.
- Access without authentication.
- Customer accessing admin functionality.

## Expected Deliverables

- Registration API.
- Login API.
- JWT authentication.
- Password hashing.
- Authentication dependencies.
- Customer/admin role checks.
- Login and registration UI.
- Protected frontend routes.
- Authentication tests.

## Completion Criteria

- [ ] Users can register.
- [ ] Users can log in.
- [ ] Passwords are securely hashed.
- [ ] JWT validation works.
- [ ] Customer and admin roles are enforced.
- [ ] Protected frontend routes work.
- [ ] Unauthorized requests are rejected.
- [ ] Authentication tests pass.

---

# 7. Phase 04 — Service and Availability Management

## Objective

Implement service and provider management, along with the availability slots customers can book.

## Concepts to Learn

- FastAPI CRUD operations.
- SQLAlchemy queries.
- Filtering and pagination.
- Database relationships.
- Date and time handling.
- Time zones.
- Business validation.
- Admin authorization.

## Tasks

### Task 4.1 — Service management

Implement APIs to:

- Create a service.
- List services.
- Retrieve service details.
- Update a service.
- Activate or deactivate a service.

Suggested service fields:

- Name.
- Description.
- Duration.
- Price.
- Active status.
- Created timestamp.

Only administrators should create, update, or deactivate services.

Customers should be able to view active services.

### Task 4.2 — Provider management

Implement provider management if the clinic workflow requires customers to select a doctor or service provider.

Requirements:

- Create providers.
- List active providers.
- Retrieve provider details.
- Update provider details.
- Activate or deactivate providers.
- Associate providers with relevant services.

### Task 4.3 — Availability management

Implement APIs to:

- Create availability slots.
- List available slots.
- Retrieve slot details.
- Update slots.
- Disable or remove slots when safe.

Suggested availability fields:

- Service ID.
- Provider ID.
- Start datetime.
- End datetime.
- Capacity.
- Active status.

### Task 4.4 — Availability validation

Validate that:

- The end time is after the start time.
- The slot is not in the past.
- The provider is available.
- The service is active.
- The slot does not conflict with another slot for the same provider.
- Capacity is a positive number.
- Existing bookings are not invalidated by an unsafe slot update.

Use a consistent timezone strategy. Store timestamps in UTC and convert to the user's local timezone for display.

### Task 4.5 — Availability listing

Create an API that allows customers to find available slots using filters such as:

- Service.
- Provider.
- Date.
- Availability status.

Do not expose inactive slots as bookable.

### Task 4.6 — Frontend implementation

Create:

- Service listing page.
- Service details view.
- Provider selection where applicable.
- Availability calendar.
- Available-slot selection.
- Admin service management.
- Admin provider management.
- Admin availability management.

## Expected Deliverables

- Service CRUD APIs.
- Provider CRUD APIs, if provider selection is included.
- Availability CRUD APIs.
- Availability validation.
- Customer service and slot selection UI.
- Admin management UI.
- Backend tests.

## Completion Criteria

- [ ] Services can be created and updated by admins.
- [ ] Customers can view active services.
- [ ] Providers can be managed where applicable.
- [ ] Admins can create and manage availability.
- [ ] Invalid or conflicting slots are rejected.
- [ ] Customers can view valid available slots.
- [ ] Tests cover important validation cases.

---

# 8. Phase 05 — Booking Management APIs

## Objective

Implement the main appointment-booking functionality.

This is one of the most important phases because the application must prevent duplicate bookings and maintain correct booking history.

## Concepts to Learn

- CRUD operations.
- Database transactions.
- Concurrency control.
- Row-level locking.
- Business-rule validation.
- Ownership checks.
- Booking lifecycle.
- Audit/history records.
- Race conditions.

## Tasks

### Task 5.1 — Define booking statuses

Use a clearly defined booking lifecycle:

- `pending`
- `confirmed`
- `cancelled`
- `completed`

Define the permitted transitions.

For example:

- Pending → Confirmed.
- Pending → Cancelled.
- Confirmed → Cancelled.
- Confirmed → Completed.

Do not allow arbitrary status changes.

### Task 5.2 — Create booking API

Create:

`POST /api/v1/bookings`

The API should:

1. Authenticate the customer.
2. Validate the selected availability slot.
3. Confirm the slot is active.
4. Check that the service and provider are valid.
5. Check remaining capacity.
6. Prevent duplicate or overlapping bookings according to the application's booking rules.
7. Create the booking.
8. Record the booking-history event.
9. Return the booking details.

### Task 5.3 — Prevent double booking

The backend must handle simultaneous booking requests safely.

Use appropriate database transactions and concurrency control.

For example:

- Lock the selected slot row while checking and reserving capacity.
- Count or otherwise track active bookings safely.
- Ensure the capacity cannot be exceeded.
- Commit the booking and its history record together.

Do not rely only on frontend checks to prevent double booking.

### Task 5.4 — Customer booking list

Create:

`GET /api/v1/bookings/my`

Requirements:

- Return only the authenticated customer's bookings.
- Support pagination.
- Support filtering by status and date.
- Return useful service and provider information.

### Task 5.5 — Booking details

Create:

`GET /api/v1/bookings/{booking_id}`

Verify that customers can access only their own booking records.

Administrators can access bookings according to their permissions.

### Task 5.6 — Reschedule booking

Create:

`PATCH /api/v1/bookings/{booking_id}/reschedule`

Requirements:

- Verify booking ownership or admin permission.
- Verify the booking is eligible for rescheduling.
- Validate the new slot.
- Check capacity and conflicts.
- Release the previous reservation safely.
- Reserve the new slot safely.
- Record the rescheduling event in booking history.

Perform the relevant operations transactionally.

### Task 5.7 — Cancel booking

Create:

`PATCH /api/v1/bookings/{booking_id}/cancel`

Requirements:

- Verify permissions.
- Validate cancellation eligibility.
- Update booking status.
- Release the reserved capacity.
- Record cancellation history.
- Return the updated booking.

### Task 5.8 — Admin booking management

Create endpoints for administrators to:

- List all bookings.
- Filter bookings.
- View booking details.
- Confirm bookings.
- Cancel bookings.
- Mark eligible bookings as completed.

### Task 5.9 — Booking history

Create an endpoint to retrieve the history of a booking.

Record important events such as:

- Booking created.
- Booking confirmed.
- Booking rescheduled.
- Booking cancelled.
- Booking completed.

### Task 5.10 — API testing

Test:

- Successful booking.
- Booking an unavailable slot.
- Booking beyond capacity.
- Duplicate booking attempts.
- Unauthorized booking access.
- Customer accessing another customer's booking.
- Successful rescheduling.
- Invalid rescheduling.
- Successful cancellation.
- Invalid status transitions.
- Concurrent booking attempts.

## Expected Deliverables

- Booking creation API.
- Booking listing API.
- Booking detail API.
- Rescheduling API.
- Cancellation API.
- Admin booking APIs.
- Booking history.
- Transaction-safe capacity handling.
- Comprehensive backend tests.

## Completion Criteria

- [ ] Customers can create bookings.
- [ ] Customers can view their bookings.
- [ ] Customers can reschedule eligible bookings.
- [ ] Customers can cancel eligible bookings.
- [ ] Admins can manage bookings.
- [ ] Booking history is recorded.
- [ ] Double booking is prevented.
- [ ] Capacity cannot be exceeded.
- [ ] Booking tests pass.

---

# 9. Phase 06 — React Frontend Foundation

## Objective

Build the frontend architecture and connect the React application to the FastAPI backend.

## Concepts to Learn

- React component architecture.
- Props and state.
- React hooks.
- Context API.
- React Router.
- Nested routes.
- Protected routes.
- Axios.
- API service modules.
- Form handling.
- Tailwind CSS.
- Responsive design.

## Tasks

### Task 6.1 — Configure React Router

Create routes for:

Customer-facing pages:

- Home.
- Services.
- Service details.
- Login.
- Registration.
- Customer dashboard.
- My bookings.
- Booking details.
- Profile.

Admin-facing pages:

- Admin dashboard.
- Manage services.
- Manage providers.
- Manage availability.
- Manage bookings.

Use protected routes for authenticated pages and role-specific routes for admin pages.

### Task 6.2 — Create common components

Create reusable components such as:

- Button.
- Input.
- Select.
- Modal.
- Dialog.
- Card.
- Badge.
- Loader.
- Empty state.
- Error message.
- Pagination.
- Confirmation dialog.

### Task 6.3 — Create layout components

Create:

- Public layout.
- Customer dashboard layout.
- Admin dashboard layout.
- Sidebar.
- Navbar.
- Footer.
- Mobile navigation.

### Task 6.4 — Configure Axios

Create a centralized API client.

Configure:

- Base URL.
- Request handling.
- Response handling.
- Authentication handling.
- Common error handling.
- Unauthorized response handling.

Avoid creating separate Axios configurations for every feature.

### Task 6.5 — Create frontend API services

Organize API functions by feature:

- Authentication service.
- Service service.
- Provider service.
- Availability service.
- Booking service.
- Profile service.

### Task 6.6 — Configure global state

Use React Context API and hooks for state that genuinely needs to be shared, such as:

- Authenticated user.
- Authentication status.
- Theme, if supported.
- Shared application-level state.

Keep local component state local.

### Task 6.7 — Implement the shared design system

Follow `ai-assistant/design.md`.

Implement:

- Color variables.
- Typography.
- Spacing.
- Buttons.
- Form fields.
- Cards.
- Status badges.
- Responsive layouts.
- Reusable UI patterns.

## Expected Deliverables

- React routing.
- Reusable components.
- Public and dashboard layouts.
- Axios configuration.
- API service modules.
- Authentication context.
- Shared design system.
- Responsive navigation.

## Completion Criteria

- [ ] All required routes exist.
- [ ] Layouts render correctly.
- [ ] Reusable components work.
- [ ] Axios communicates with FastAPI.
- [ ] Shared authentication state works.
- [ ] Responsive navigation works.
- [ ] Frontend code follows the feature-based structure.

---

# 10. Phase 07 — Customer Dashboard and Booking UI

## Objective

Build the complete customer experience.

## Concepts to Learn

- React forms.
- Form validation.
- API integration.
- Async state management.
- Loading and error states.
- Date and time selection.
- Conditional rendering.
- Data filtering.
- User experience design.

## Tasks

### Task 7.1 — Customer dashboard

Display:

- Upcoming appointments.
- Total bookings.
- Completed bookings.
- Cancelled bookings.
- Quick booking action.

Use real API data rather than hardcoded dashboard values.

### Task 7.2 — Browse services

Build a service browsing interface.

Customers should be able to:

- View active services.
- Search services.
- View service details.
- Understand duration and price.
- Select a service to continue booking.

### Task 7.3 — Booking flow

Implement a clear step-by-step booking flow:

1. Select service.
2. Select provider, if applicable.
3. Select appointment date.
4. View available slots.
5. Select an available slot.
6. Review booking information.
7. Confirm the booking.
8. Display booking confirmation.

The frontend must use backend availability data.

### Task 7.4 — My bookings

Display:

- Upcoming bookings.
- Pending bookings.
- Completed bookings.
- Cancelled bookings.

Include:

- Booking reference.
- Service name.
- Provider name where applicable.
- Appointment date and time.
- Booking status.
- Booking details action.

### Task 7.5 — Reschedule booking

Provide a rescheduling interface.

- Show the current appointment.
- Allow eligible bookings to select a new slot.
- Confirm the change.
- Display the updated booking.
- Refresh the booking history.

### Task 7.6 — Cancel booking

Provide a cancellation flow.

- Ask for confirmation.
- Send the cancellation request to the backend.
- Display the updated status.
- Refresh relevant booking information.

### Task 7.7 — Customer profile

Implement:

- View profile.
- Update profile details.
- Display account information.
- Validate profile updates.

### Task 7.8 — UI states

Implement:

- Loading state.
- Empty state.
- Error state.
- Success notification.
- Disabled controls.
- Form validation feedback.

## Expected Deliverables

- Customer dashboard.
- Service browsing pages.
- Appointment booking wizard.
- Available-slot selector.
- My bookings page.
- Booking details page.
- Rescheduling UI.
- Cancellation UI.
- Profile management.

## Completion Criteria

- [ ] Customers can browse services.
- [ ] Customers can find available slots.
- [ ] Customers can book appointments.
- [ ] Customers can view booking history.
- [ ] Customers can reschedule eligible bookings.
- [ ] Customers can cancel eligible bookings.
- [ ] Customer profile can be updated.
- [ ] Loading, error, and empty states work.
- [ ] UI is responsive.

---

# 11. Phase 08 — Admin Dashboard

## Objective

Build the administrative interface for managing the clinic or service center.

## Concepts to Learn

- Role-specific UI.
- Admin CRUD operations.
- Data tables.
- Filtering and sorting.
- Pagination.
- Dashboard summaries.
- Form modals.
- Authorization.
- Admin workflows.

## Tasks

### Task 8.1 — Admin dashboard

Display useful summary information:

- Total bookings.
- Pending bookings.
- Confirmed bookings.
- Completed bookings.
- Cancelled bookings.
- Total active services.
- Total active providers, if provider management is enabled.

Use backend aggregation endpoints for summary information.

### Task 8.2 — Service management

Implement:

- Service list.
- Create service.
- Edit service.
- Activate service.
- Deactivate service.
- Search and filter.

### Task 8.3 — Provider management

If provider management is included:

- Provider list.
- Create provider.
- Edit provider.
- Activate provider.
- Deactivate provider.
- Associate providers with services.

### Task 8.4 — Availability management

Implement:

- Availability calendar.
- Create availability slot.
- Edit availability slot.
- Disable availability.
- View booked and remaining capacity.
- Prevent unsafe changes to slots with existing bookings.

### Task 8.5 — Booking management

Implement:

- All bookings table.
- Booking details.
- Search and filtering.
- Status filtering.
- Date filtering.
- Booking confirmation.
- Booking cancellation.
- Marking eligible bookings as completed.

### Task 8.6 — Admin permissions

Ensure:

- Admin pages require authentication.
- Admin pages require the correct role.
- Backend admin endpoints verify authorization.
- Hiding admin buttons in the frontend is not considered security.

### Task 8.7 — Admin UI polish

Implement:

- Responsive sidebar.
- Summary cards.
- Data tables.
- Filters.
- Pagination.
- Confirmation dialogs.
- Notifications.
- Loading and error states.

## Expected Deliverables

- Admin dashboard.
- Service management.
- Provider management, if included.
- Availability management.
- Booking management.
- Admin authorization.
- Admin tests.

## Completion Criteria

- [ ] Admin dashboard displays real data.
- [ ] Admin can manage services.
- [ ] Admin can manage availability.
- [ ] Admin can manage providers, if applicable.
- [ ] Admin can manage bookings.
- [ ] Customer accounts cannot access admin APIs.
- [ ] Admin UI is responsive.
- [ ] Admin workflows are tested.

---

# 12. Phase 09 — Testing, Validation, and Security

## Objective

Verify that the application works correctly and is secure enough for its intended use.

## Concepts to Learn

- Unit testing.
- Integration testing.
- End-to-end testing.
- API testing.
- React component testing.
- Form validation.
- Authorization testing.
- Security testing.
- Error handling.
- Test fixtures and test databases.

## Tasks

### Task 9.1 — Backend unit tests

Use Pytest to test:

- Utility functions.
- Password hashing.
- JWT creation and validation.
- Business validation.
- Booking status transitions.
- Availability calculations.

### Task 9.2 — Backend integration tests

Use HTTPX and a dedicated test database.

Test:

- Registration.
- Login.
- User profile.
- Service APIs.
- Provider APIs.
- Availability APIs.
- Booking APIs.
- Rescheduling.
- Cancellation.
- Admin authorization.

Tests must not accidentally modify the user's normal development database.

### Task 9.3 — Frontend tests

Use Vitest and React Testing Library.

Test:

- Login form.
- Registration form.
- Protected routes.
- Service list.
- Slot selection.
- Booking flow.
- Booking status display.
- Rescheduling and cancellation interactions.
- Admin components.

### Task 9.4 — End-to-end tests

Use Playwright to verify important user journeys.

Customer journey:

1. Register.
2. Log in.
3. Browse services.
4. Select an appointment slot.
5. Create a booking.
6. View the booking.
7. Reschedule the booking.
8. Cancel the booking.

Admin journey:

1. Log in as admin.
2. Create or update a service.
3. Create availability.
4. View bookings.
5. Update a booking status.

### Task 9.5 — Security review

Review:

- Password hashing.
- JWT validation.
- Token expiration.
- Role checks.
- Booking ownership checks.
- SQL injection protection through safe ORM usage.
- Input validation.
- CORS configuration.
- Secret management.
- Error messages.
- Rate limiting for sensitive endpoints where appropriate.
- Protection against unauthorized data access.

### Task 9.6 — Booking concurrency testing

Test simultaneous booking requests for the same slot.

Verify:

- Capacity is never exceeded.
- Two requests cannot reserve the same single-capacity slot.
- Database transactions leave consistent data.
- Failed reservations do not leave partial booking records.

### Task 9.7 — Responsive and accessibility testing

Test:

- Desktop layouts.
- Tablet layouts.
- Mobile layouts.
- Keyboard navigation.
- Form labels.
- Focus states.
- Color contrast.
- Accessible error messages.

### Task 9.8 — Bug fixing

Create a list of issues and resolve them before release.

Do not ignore failed tests or known authorization problems.

## Expected Deliverables

- Backend test suite.
- Frontend test suite.
- Playwright end-to-end tests.
- Security review checklist.
- Responsive test results.
- Bug-fix report.

## Completion Criteria

- [ ] Backend tests pass.
- [ ] Frontend tests pass.
- [ ] Important Playwright flows pass.
- [ ] Authentication and authorization tests pass.
- [ ] Booking concurrency tests pass.
- [ ] No known critical security issues remain.
- [ ] Mobile and desktop layouts work.
- [ ] No unresolved critical bugs remain.

---

# 13. Phase 10 — Docker, Deployment, and Documentation

## Objective

Prepare the application for reproducible development and deployment.

## Concepts to Learn

- Docker images and containers.
- Dockerfiles.
- Docker Compose.
- Environment configuration.
- Production builds.
- Deployment architecture.
- Database backups.
- Logging.
- API documentation.
- Application maintenance.

## Tasks

### Task 10.1 — Dockerize the backend

Create a backend Dockerfile.

Requirements:

- Install Python dependencies.
- Configure the working directory.
- Start the FastAPI application.
- Read configuration from environment variables.
- Avoid including secrets in the image.

### Task 10.2 — Dockerize the frontend

Create a frontend Dockerfile.

Requirements:

- Build the React application.
- Serve the production frontend using an appropriate web server.
- Configure the API base URL correctly.
- Avoid exposing development-only configuration.

### Task 10.3 — Configure Docker Compose

Create a Docker Compose configuration for the application services.

Make database connectivity configurable.

**Important:** During local development, the primary database remains the PostgreSQL installation managed through pgAdmin 4. Do not silently switch the project to SQLite or replace the user's local PostgreSQL database with an unrelated database.

If PostgreSQL is later containerized for a separate deployment or team environment, document that setup explicitly and keep the application database URL configurable.

### Task 10.4 — Environment separation

Prepare separate configuration for:

- Local development.
- Testing.
- Production.

Do not commit actual credentials.

### Task 10.5 — Production readiness

Review:

- Production frontend build.
- Backend startup configuration.
- CORS origins.
- Database connection.
- Secret management.
- Logging.
- Error handling.
- API documentation.
- Database migration process.

### Task 10.6 — Database backup guidance

Document how to back up and restore the PostgreSQL database.

Include pgAdmin 4 backup/restore steps or equivalent PostgreSQL commands.

### Task 10.7 — README documentation

The root README should explain:

- Project overview.
- Main features.
- Technology stack.
- Folder structure.
- Prerequisites.
- Local PostgreSQL setup.
- Environment variables.
- Frontend installation and startup.
- Backend installation and startup.
- Alembic migration commands.
- Test commands.
- Docker commands.
- API documentation URL.
- Demo/admin account setup instructions, if applicable.

Never publish real passwords or production secrets in the README.

### Task 10.8 — Final verification

Perform a complete end-to-end verification.

Verify that:

- The frontend starts.
- The backend starts.
- PostgreSQL connects.
- Migrations run.
- Registration and login work.
- Customers can book appointments.
- Customers can reschedule and cancel eligible bookings.
- Admins can manage services and availability.
- Admins can manage bookings.
- Tests pass.
- Documentation is accurate.

## Expected Deliverables

- Backend Dockerfile.
- Frontend Dockerfile.
- Docker Compose configuration.
- Environment templates.
- Production configuration guidance.
- Database backup/restore documentation.
- Complete README.
- Final verification report.

## Completion Criteria

- [ ] Frontend production build succeeds.
- [ ] Backend runs with production configuration.
- [ ] PostgreSQL connection works.
- [ ] Database migrations run successfully.
- [ ] Docker configuration works.
- [ ] Secrets are not committed.
- [ ] README contains setup instructions.
- [ ] Main customer and admin workflows work.
- [ ] Final tests pass.

---

# 14. Overall Phase Tracking

Use this table to track project progress.

| Phase | Name | Status |
|---|---|---|
| 01 | Project Planning and Environment Setup | Completed |
| 02 | Database Design and Backend Foundation | Completed |
| 03 | Authentication and Authorization | Completed |
| 04 | Service and Availability Management | Completed |
| 05 | Booking Management APIs | Not Started |
| 06 | React Frontend Foundation | Not Started |
| 07 | Customer Dashboard and Booking UI | Not Started |
| 08 | Admin Dashboard | Not Started |
| 09 | Testing, Validation, and Security | Not Started |
| 10 | Docker, Deployment, and Documentation | Not Started |

Update the status as:

- Not Started
- In Progress
- Blocked
- Completed

Do not mark a phase completed until its completion criteria have been verified.

---

# 15. Rules for the AI Coding Assistant

The AI coding assistant must follow these rules throughout development.

1. Follow the phases in the exact order defined in this document.
2. Do not implement multiple major phases at once.
3. Do not skip concepts or requirements.
4. Use JavaScript only in the React frontend.
5. Use FastAPI and Python for the backend.
6. Use PostgreSQL as the primary database.
7. Use pgAdmin 4 for local database administration.
8. Use SQLAlchemy for database access.
9. Use Alembic for schema migrations.
10. Follow the architecture in `architecture.md`.
11. Follow the UI guidelines in `design.md`.
12. Keep the code modular and reusable.
13. Follow the existing folder structure unless a justified change is needed.
14. Never overwrite existing working code without first understanding its purpose.
15. Do not generate fake API responses as a substitute for real backend integration in completed features.
16. Do not hardcode passwords, JWT secrets, or API credentials.
17. Implement backend validation even when frontend validation exists.
18. Enforce authentication and authorization on the backend.
19. Protect customer booking data through ownership checks.
20. Prevent double booking through database-safe transaction handling.
21. Explain important code decisions in beginner-friendly language.
22. Provide exact filenames and folder paths when sharing code.
23. Provide complete code for each requested file rather than disconnected fragments.
24. Explain how to run and test each implemented feature.
25. Fix errors in the current phase before moving forward.
26. Update relevant documentation when implementation decisions change.
27. Do not claim a feature is complete without testing it.

---

# 16. Definition of Project Completion

The Service Booking Application can be considered complete when:

- Customers can register and log in.
- Customers can browse active services.
- Customers can view valid availability.
- Customers can create appointments.
- Customers can view their own booking history.
- Customers can reschedule eligible appointments.
- Customers can cancel eligible appointments.
- Administrators can manage services.
- Administrators can manage providers where applicable.
- Administrators can manage availability.
- Administrators can manage bookings.
- JWT authentication and role-based authorization work.
- PostgreSQL stores application data correctly.
- Booking capacity and concurrency rules are enforced.
- Frontend and backend tests pass.
- The application is responsive.
- Docker configuration is available.
- Setup and usage documentation is complete.

**Final development principle:** Build a working, tested, secure feature at a time. Correctness and understanding are more important than rushing through all ten phases.