# Finance Backend

A role-based finance data management REST API built with Node.js, Express, and SQLite.

# Live URL : 
https://finance-backend-8sky.onrender.com

# API Documentation
https://documenter.getpostman.com/view/40594386/2sBXiqEojJ

---

## Environment Variables
```
PORT=3000
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
```
---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js v22 |
| Framework | Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | express-validator |
| Testing | Jest + Supertest |

---

## Roles and Permissions

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View records | ✅ | ✅ | ✅ |
| View dashboard | ❌ | ✅ | ✅ |
| Create / Update / Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## API Reference

All protected routes require:

Authorization: Bearer <token>

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Users — Admin only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update role, status, or password |
| DELETE | `/api/users/:id` | Delete a user |

### Records — Read: all roles, Write: admin only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/records` | List records (filter by `type`, `category`, `from`, `to`) |
| GET | `/api/records/:id` | Get record by ID |
| POST | `/api/records` | Create a record |
| PATCH | `/api/records/:id` | Update a record |
| DELETE | `/api/records/:id` | Soft delete a record |

### Dashboard — Analyst and Admin only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Total income, expenses, net balance |
| GET | `/api/dashboard/categories` | Breakdown per category |
| GET | `/api/dashboard/trends` | Monthly income and expense totals |
| GET | `/api/dashboard/recent` | Most recent transactions |

All dashboard endpoints support optional `?from=YYYY-MM-DD&to=YYYY-MM-DD` filters.

---

## Project Structure
```
src/
├── config/       # DB connection, role constants
├── middleware/   # auth, authorize, validation, error handler, rate limiter
├── models/       # DB queries for users and records
├── routes/       # auth, users, records, dashboard
└── services/     # business logic for each domain
db/
└── migrations.js
tests/
├── unit/         # authService, dashboardService, authorize middleware
└── integration/  # auth, records, dashboard routes
```
---

---

## Running Tests
```bash
npm test
```

Tests use an in-memory SQLite database and never touch the development database.

---

## Key Design Decisions

- **SQLite** — zero configuration, single file, ideal for this scope
- **Soft deletes** — records are never permanently removed, only flagged as deleted
- **Role hierarchy** — `viewer < analyst < admin`. Access control uses a single `authorize(minimumRole)` middleware
- **Rate limiting** — general limit of 100 req/15 min on all routes, stricter 10 req/15 min on auth routes to prevent brute force
- **Role on register** — for simplicity roles can be set on register. In production new users would default to viewer and be promoted by an admin

---