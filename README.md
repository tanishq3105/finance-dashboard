# Finance Dashboard API

A role-based financial records management backend built with Node.js, Express, TypeScript, and MongoDB. Designed to serve a finance dashboard frontend with secure multi-role access control, financial record management, and aggregated analytics.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB (via Mongoose) |
| Authentication | JWT (access + refresh tokens via httpOnly cookies) |
| Validation | Zod |
| Testing | Vitest + Supertest |

---

## Project Structure

```
src/
├── __tests__/          # Route-level integration tests
├── config/             # App configuration
├── controllers/        # Request handlers (auth, users, records, dashboard, audit)
├── db/                 # MongoDB connection
├── middlewares/        # Auth, RBAC, and audit middlewares
├── models/             # Mongoose models (User, Record, AuditLog)
├── routes/             # Express routers
├── services/           # Business logic (audit logging)
├── types/              # TypeScript interfaces and type definitions
├── utils/              # ApiError, ApiResponse, asyncHandler, tokenGenerator
├── validators/         # Zod schemas (auth, user, records, env)
├── app.ts              # Express app setup
└── index.ts            # Server entry point
```

---

## Setup & Running

### Prerequisites

- Node.js v18+
- A running MongoDB instance (local or MongoDB Atlas)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/tanishq3105/finance-dashboard.git
cd finance-dashboard

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Start the development server
npm run dev
```

The server will start at `http://localhost:8000`.

---

## Environment Variables

Create a `.env` file in the project root with the following keys:

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `PORT` | Port to run the server on | `8000` |
| `ACCESS_TOKEN_SECRET` | Secret key for signing access tokens | `your_access_secret` |
| `REFRESH_TOKEN_SECRET` | Secret key for signing refresh tokens | `your_refresh_secret` |
| `ACCESS_TOKEN_EXPIRATION` | Access token expiry duration | `15m` |
| `REFRESH_TOKEN_EXPIRATION` | Refresh token expiry duration | `7d` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |

> All environment variables are validated at startup using Zod. The server will refuse to start if any required variable is missing.

---

## Authentication

Authentication uses **JWT tokens stored in httpOnly cookies** — not Authorization headers. This protects tokens from XSS attacks.

On login or register, two cookies are set:
- `accessToken` — short-lived, used for API requests
- `refreshToken` — long-lived, stored in the database for rotation

All protected routes require a valid `accessToken` cookie. The auth middleware verifies the token and attaches the decoded user (`_id`, `name`, `email`, `role`, `status`) to `req.user`.

---

## Role-Based Access Control

Three roles are supported. Each role has a fixed set of permissions enforced by the RBAC middleware on every protected route.

| Permission | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| `records:read` | ✅ | ✅ | ✅ |
| `dashboard:read` | ✅ | ✅ | ✅ |
| `dashboard:insights` | ❌ | ✅ | ✅ |
| `records:write` | ❌ | ❌ | ✅ |
| `records:delete` | ❌ | ❌ | ✅ |
| `users:manage` | ❌ | ❌ | ✅ |
| `audit:read` | ❌ | ❌ | ✅ |

Permissions are checked declaratively at the route level:

```ts
router.post("/records", auth, permission("records:write"), handler);
```

---

## API Reference

Base URL: `/api/v1`

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user (role defaults to `viewer`) |
| `POST` | `/auth/login` | Public | Login and receive tokens as cookies |
| `POST` | `/auth/logout` | Any | Clear auth cookies |
| `GET` | `/auth/me` | Any | Get current logged-in user profile |

### Users

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/users` | Admin | List all users |
| `POST` | `/users` | Admin | Create a user with a specified role |
| `GET` | `/users/:id` | Admin | Get a user by ID |
| `PATCH` | `/users/:id` | Admin | Update user name or email |
| `DELETE` | `/users/:id` | Admin | Delete a user |
| `PATCH` | `/users/:id/role` | Admin | Change a user's role |
| `PATCH` | `/users/:id/status` | Admin | Activate or deactivate a user |

### Financial Records

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/records` | Viewer+ | List records with filters and pagination |
| `GET` | `/records/:id` | Viewer+ | Get a single record by ID |
| `POST` | `/records` | Admin | Create a new financial record |
| `PATCH` | `/records/:id` | Admin | Update a record |
| `DELETE` | `/records/:id` | Admin | Soft delete a record |
| `PATCH` | `/records/:id/restore` | Admin | Restore a soft-deleted record |

**Query parameters for `GET /records`:**

| Param | Type | Description |
|---|---|---|
| `type` | `income` \| `expense` | Filter by record type |
| `category` | string | Filter by category |
| `from` | date string | Filter records from this date |
| `to` | date string | Filter records up to this date |
| `page` | number | Page number (default: `1`) |
| `limit` | number | Records per page (default: `20`) |
| `sort` | string | Sort field: `amount`, `date`, `category` (default: `date`) |
| `order` | `asc` \| `desc` | Sort direction (default: `desc`) |

### Dashboard

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/dashboard/summary` | Viewer+ | Total income, expenses, and net balance |
| `GET` | `/dashboard/recent` | Viewer+ | Most recent 10 transactions |
| `GET` | `/dashboard/by-category` | Analyst+ | Income and expense totals per category |
| `GET` | `/dashboard/trends` | Analyst+ | Monthly income vs expense for last N months |
| `GET` | `/dashboard/top-categories` | Analyst+ | Top N categories by total amount |

**Query parameters:**

| Param | Endpoint | Description |
|---|---|---|
| `months` | `/trends` | Number of months to look back (default: `6`) |
| `limit` | `/top-categories` | Number of top categories to return (default: `5`) |

### Audit Log

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/audit` | Admin | Paginated list of all audit log entries |
| `GET` | `/audit/:userId` | Admin | Audit log filtered by a specific user |

**Query parameters for both audit endpoints:**

| Param | Description |
|---|---|
| `page` | Page number (default: `1`) |
| `limit` | Entries per page (default: `20`) |

---

## Audit Logging

The audit log is **append-only and write-protected** — there is no public endpoint to create audit entries. All entries are written internally by the audit middleware whenever a mutating operation (`POST`, `PATCH`, `DELETE`) succeeds.

Each entry records:
- Which user performed the action
- What action was taken (`CREATE`, `UPDATE`, `DELETE`)
- Which entity was affected (`record`, `user`)
- The ID of the affected entity
- Timestamp

This ensures the audit trail cannot be tampered with through the API.

---

## Data Models

### User
```
name        String    required
email       String    required, unique
password    String    required, bcrypt hashed
role        String    viewer | analyst | admin (default: viewer)
status      String    active | inactive (default: active)
refreshToken String   stored for token rotation
```

### Financial Record
```
amount      Number    required, must be positive
type        String    income | expense
category    String    required
date        Date      required
notes       String    optional
created_by  ObjectId  reference to User
is_deleted  Boolean   default: false (soft delete)
```

### Audit Log
```
user_id     ObjectId  reference to User
action      String    CREATE | UPDATE | DELETE | READ
entity      String    record | user | dashboard | auth
entity_id   ObjectId  ID of the affected document
timestamp   Date      auto-set on creation
```

---

## Running Tests

```bash
npm run test
```

Tests cover all 20 routes verifying correct middleware execution order (auth → permission → audit → handler) and expected HTTP status codes. Mocks are used for all controllers and middlewares so tests are fast and isolated from the database.

---

## Design Decisions

**MongoDB over a relational DB** — Financial records in this system have a simple, consistent shape with no complex joins required. MongoDB with Mongoose gave us schema validation, easy timestamps, and ObjectId references without the overhead of migrations for a project of this scope.

**httpOnly cookies over Authorization headers** — Storing JWTs in cookies rather than localStorage protects against XSS attacks. The `sameSite: strict` and `secure` flags add further protection.

**Audit log written internally, never via API** — Exposing a write endpoint for audit logs would allow anyone with admin access to forge entries. Instead, the audit middleware fires automatically after every successful mutation at the HTTP layer — completely outside the control of the request sender.

**Separate endpoints for role and status changes** — `PATCH /users/:id/role` and `PATCH /users/:id/status` are intentionally kept separate from the general `PATCH /users/:id`. This makes it explicit in the audit log that a privilege change occurred, and prevents accidental role escalation through a general update call.

**Dashboard scoped to the requesting user** — Dashboard analytics currently aggregate records belonging to the logged-in user (`created_by: req.user._id`). In a multi-user admin context this could be changed to aggregate across all records — this was a deliberate simplification given the scope of the assignment.

**Permissions defined as a declarative map** — Rather than writing role checks as `if (role === 'admin')` throughout the codebase, permissions are modeled as a typed map and checked via a single reusable middleware. Adding a new role or permission requires changing exactly one place.

---

## Assumptions Made

- A user who self-registers always gets the `viewer` role. Only an admin can assign `analyst` or `admin` roles.
- The first admin must be created directly in the database (via a seed script or MongoDB Atlas) since there is no open endpoint for admin registration — this is intentional to prevent privilege escalation.
- Soft-deleted records are excluded from all queries and analytics by default. Only the restore endpoint makes them visible.
- Inactive users can still have their data queried by admins — deactivating a user blocks login but does not delete their records.
- The `date` field on records represents the transaction date, not the creation date.
