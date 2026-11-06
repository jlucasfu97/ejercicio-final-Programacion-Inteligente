# AstroBookings — Architectural Design Document

System view (client + API). Backend internals: [`activity-bookings-express/ADD.md`](../activity-bookings-express/ADD.md).

## Systems architecture

```text
┌──────────────────────────┐   HTTPS/JSON + Bearer JWT   ┌──────────────────────────────┐
│ astrobookings-client     │ ──────────────────────────▶ │ activity-bookings-express    │
│ Angular 22 SPA  :4200    │ ◀────────────────────────── │ Express 4 API  :3000         │
│ localStorage: session    │                             │ JSON store db/ + mock gateway│
└──────────────────────────┘                             └──────────────────────────────┘
```

## API contract used by the client

| Method | Path | Auth | Client use |
|---|---|---|---|
| POST | `/users` | — | Register (`username`, `email`, `password`, `terms`) → `{ user, accessToken }` |
| POST | `/login` | — | Log in (`email`, `password`) → `{ user, accessToken }` |
| GET | `/activities?q=&_sort=date` | — | Catalogue and search |
| GET | `/activities/:id` | — | Launch detail |
| POST | `/bookings` | Bearer | Book (`activityId`, `participants`) → booking + payment |
| GET | `/bookings` | Bearer | My bookings |
| GET | `/bookings/:id` | Bearer | Booking detail |
| GET | `/health` | — | Liveness |

Also available, not used by the client yet: `PUT`/`DELETE /activities/:id`, `PATCH /activities/:id/status`.

Errors are always JSON `{ message, errors: [{ field, message }] }`. Status codes: 400 validation/business rule, 401 auth, 403 not owner,
404 not found, 409 conflict, 500 unexpected. The client maps messages to Spanish in `core/api-errors.ts`.

## Software architecture

**Backend**: Routes (HTTP) → Services (validation + rules) → Repositories (JSON files). Singletons wired in
`src/container.ts` after data load.

**Client**: `core/` (API token, models, auth store, interceptor, guards, error mapping) → `features/<area>/`
(one lazy-loaded component per screen) → `shared/` (presentational). Reads with `httpResource`, writes with
`HttpClient` from Signal Forms `submission`.

## Architecture Decision Records

| # | Decision | Why | Status |
|---|---|---|---|
| ADR1 | Monorepo with a **copy** of the backend; the original stays untouched | Fix bugs without altering course material | Accepted |
| ADR2 | Composition root (`container.ts`) for backend services | Services created at import time ran before data load (ID collisions, failed logins) | Accepted |
| ADR3 | JWT HS256 with secret from `JWT_SECRET`, user re-checked per request | Hardcoded secret and `alg` confusion allowed forged tokens | Accepted |
| ADR4 | scrypt password hashes with lazy migration | Plain-text passwords in `db/users.json` | Accepted |
| ADR5 | Playwright API tests over an isolated DB (`DB_DIR`, port 3100) | Tests must not touch dev data and must be repeatable | Accepted |
| ADR6 | Angular 22 zoneless + signals + Signal Forms + `httpResource` | Current stable Angular primitives; less code than RxJS + Reactive Forms | Accepted |
| ADR7 | Session in `localStorage`, discarded when token expires; 401 ⇒ logout | Simple; acceptable for a training app (see PRD warning) | Accepted |
| ADR8 | Catalogue filters bookable statuses and future dates client-side | API has no status/date filter | Accepted — revisit with `feat-available-seats` |

New decisions: add a row here in the same change that implements them (architect agent).
