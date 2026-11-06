---
name: coding-express-api
description: Conventions for adding or changing endpoints, services and rules in activity-bookings-express (Express 4 + TypeScript strict + JSON repositories). Use whenever editing backend src/.
---

# Coding the Express API

## Layers
- **Route** (`src/routes/*.ts`): parse request, call service, map result/error to status + JSON. No rules here.
- **Service** (`src/services/*.ts`): all validation and business rules; throws typed errors with a `message`.
- **Repository** (`src/repositories/*`): load/save JSON in `DB_DIR` (default `db/`). Use `getNextId()`.
- **Wiring**: `src/container.ts` creates singletons after `loadAllData()`. Import services from there.

## Adding an endpoint
1. Types in `src/types/` (and `client/` if shared with clients).
2. Service method with validation (types, ranges, integers, allowed statuses, ownership).
3. Route: `authenticateToken` if private; owner check before validation (403 before 400).
4. Register router in `src/index.ts` (after `./container` import, before the 404 handler).
5. Tests in `tests/<area>.spec.ts` — see `testing-api-playwright`.
6. README endpoint list + "Booking rules"; CHANGELOG entry; `docs/ADD.md` contract table.

## Status codes
`200` read/update · `201` create · `204` delete · `400` validation/rule · `401` auth · `403` not owner ·
`404` missing · `409` conflict · `500` unexpected. Errors: `{ "message": "...", "errors": [{ "field": "...", "message": "..." }] }` (`errors` may be empty).

## Gotchas
- Never create services at import time in a route module.
- Whitelist updatable fields; never spread `req.body` into an entity.
- Derived values (e.g. booked seats) are computed, not stored, unless the spec says otherwise.
- `JWT_SECRET` must be set for stable sessions in dev (`JWT_SECRET=dev-secret npm run dev`).
