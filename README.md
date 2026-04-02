# Finance RBAC Dashboard

**Repository:** [github.com/bsurajpatra/finance-rbac-dashboard](https://github.com/bsurajpatra/finance-rbac-dashboard)

A backend-focused finance dashboard system built with Node.js, Express, TypeScript, and MongoDB Atlas. Implements role-based access control (RBAC) across three roles — Viewer, Analyst, and Admin — covering financial transaction management, dashboard analytics, and user administration.

> **Note:** The frontend (React + Vite) is a minimal UI built purely for testing and demonstrating the backend APIs. The core submission is the backend.

---

## Tech Stack

**Backend**
- Node.js + TypeScript
- Express.js
- MongoDB Atlas (via Mongoose)
- JWT (Access Token — 15min + Refresh Token — 7days)
- bcrypt (10 salt rounds)
- Helmet, CORS, express-rate-limit, Morgan

**Frontend (Testing UI only)**
- React + Vite

---

## Project Structure

```
dashboard/
├── server/         # Backend — core submission
│   ├── src/
│   │   ├── config/         # Seed scripts
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth + RBAC guards
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── types/          # Enums and interfaces
│   │   ├── utils/          # JWT helpers
│   │   └── app.ts          # Entry point
│   └── .env
└── client/         # Frontend — testing UI only
    └── .env
```

---

## Environment Variables

### Server — `server/.env`

```dotenv
PORT=
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

| Variable | Description |
|----------|-------------|
| `PORT` | Port the server runs on (e.g. `5000`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens |
| `ADMIN_EMAIL` | Email for the auto-seeded admin account |
| `ADMIN_PASSWORD` | Password for the auto-seeded admin account |

### Client — `client/.env`

```dotenv
VITE_API_BASE_URL=http://localhost:5000
```

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Base URL of the backend server (e.g. `http://localhost:5000`) |

> The `/api/v1` prefix is handled internally in `src/api/api.js` — do not append it to the URL.

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account and cluster (free tier works fine)

### 1. Clone the repository

```bash
git clone https://github.com/bsurajpatra/finance-rbac-dashboard.git
cd finance-rbac-dashboard
```

### 2. Configure and run the server

```bash
cd server
npm install
```

Create `server/.env` and fill in all variables listed above. Then:

```bash
npm run dev
```

### 3. Configure and run the client (testing UI only)

```bash
cd ../client
npm install
```

Create `client/.env` and set:

```dotenv
VITE_API_BASE_URL=http://localhost:5000
```

Then:

```bash
npm run dev
```

**What the frontend includes:**

- **Login / Register pages** — authenticate with any seeded or registered user account
- **Dashboard page** — displays total income, expenses, net balance, category breakdown, and recent transactions (visible to Analyst and Admin only)
- **Transactions page** — browse, filter, and paginate all financial records (visible to all roles; create/update/delete restricted to Admin)
- **Users page** — list all users, update roles, and toggle account status (Admin only)

**How to use it for testing:**

1. Start the backend server first
2. Log in using the seeded Admin credentials from `server/.env`
3. Use the Users page to create additional accounts and assign them Viewer or Analyst roles
4. Switch accounts to verify role-based access restrictions work as expected

> This frontend is intentionally minimal — it exists solely to demonstrate and test the backend APIs visually.

---

## Auto Seeding on Boot

On the very first server start, two seed scripts run automatically:

**1. Admin Seeding (`seedAdmin.ts`)**
- Checks if any Admin user exists in the database
- If none found, creates one using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`
- Password is hashed with bcrypt before storing
- Skips silently on subsequent boots if an Admin already exists

**2. Dummy Data Seeding (`seedDummy.ts`)**
- Populates the database with sample transactions for testing the dashboard
- Allows the frontend testing UI to show realistic data immediately on first boot

> Use the seeded Admin credentials to log in and test all role-based flows.

---

## API Endpoints

### Auth — `/api/v1/auth`

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Register new user (defaults to VIEWER role) |
| POST | `/login` | Public | Login — returns access token + refresh token |

### Transactions — `/api/v1/transactions`

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | Admin | Create a transaction |
| GET | `/` | All roles | List transactions (filterable + paginated) |
| PUT | `/:id` | Admin | Update a transaction |
| DELETE | `/:id` | Admin | Soft delete a transaction |

**Supported query params for GET:**
- `type` — `income` or `expense`
- `category` — any category string
- `startDate` / `endDate` — ISO date strings
- `page` / `limit` — pagination controls

### Dashboard — `/api/v1/dashboard`

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/summary` | Analyst, Admin | Returns total income, expenses, net balance, category breakdown, recent transactions |

### Users — `/api/v1/users`

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Admin | List all users (paginated, searchable by name/email) |
| PATCH | `/:id/role` | Admin | Update a user's role |
| PATCH | `/:id/status` | Admin | Activate or suspend a user account |

### Health Check

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/health` | Confirms server is running |

---

## RBAC Matrix

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View transactions | Yes | Yes | Yes |
| View dashboard summary | No | Yes | Yes |
| Create transaction | No | No | Yes |
| Update transaction | No | No | Yes |
| Delete transaction | No | No | Yes |
| Manage users (list, role, status) | No | No | Yes |

---

## Key Features

- JWT authentication — 15-minute access token + 7-day refresh token rotation
- Auto logout after 10 minutes of client inactivity
- Soft delete on transactions — records are flagged `isDeleted: true`, never physically removed, preserving the audit trail
- Pagination on transactions and users
- Filtering on transactions by type, category, and date range
- Search on users by name or email
- Rate limiting — 100 requests per 15 minutes globally, 20 per 15 minutes on auth routes (brute-force protection)
- Helmet HTTP security headers
- Morgan HTTP request logging
- Decimal precision on all financial amounts (rounded to 2 decimal places)
- `createdAt` and `updatedAt` timestamps on all records
- Consistent response envelope: `{ success, message, data }` across all endpoints
- Password never returned in any API response

---

## Assumptions and Tradeoffs

- All self-registered users are assigned the VIEWER role by default. Only an Admin can elevate roles.
- Transactions are organization-wide — all authenticated users can read all transactions. RBAC restricts who can write or delete.
- Soft delete is used instead of hard delete to keep financial records intact for auditing.
- Refresh tokens are stateless (not stored server-side). In a production system, a token blacklist or Redis store would be added to support forced logout.
- Dashboard summary is intentionally restricted to Analyst and Admin. Viewers can browse transactions but cannot access aggregated insights.
- MongoDB Atlas is used as the database. No local MongoDB installation is required — just a valid Atlas connection string in `.env`.
- The frontend is a minimal testing interface and is not part of the core evaluation.