# REST API test suite

- **Type**: chore · **Project**: api · **Status**: Done
- **Reference**: PRD BR3, TR6 · ADD ADR5

## Problem

There was no automated check that the data sent and stored through the REST API is correct.

## Acceptance criteria (EARS)

- [x] WHEN `npm test` runs THE suite SHALL start its own API on port 3100 over an isolated copy of `db/`.
- [x] THE suite SHALL never modify the development `db/` folder.
- [x] THE suite SHALL check, for each endpoint, the status code, the response body and the persisted data.
- [x] THE suite SHALL cover validation errors, auth errors and business rules for users, activities and bookings.
- [x] WHEN run twice in a row THE suite SHALL pass both times.

## Plan

- [x] `playwright.config.ts` with `webServer` (`DB_DIR=tests/.db`, `JWT_SECRET=playwright-test-secret`).
- [x] `tests/support/`: `prepare-db.mjs`, `api.ts` helpers, `jwt.ts`.
- [x] Specs: `smoke` (5), `users` (25), `activities` (43), `bookings` (29) = 102 tests.
- [x] Scripts `test`, `test:report`, `typecheck:tests`; ignore `tests/.db`, reports.

## Verification

`npm test` → 102 passed (repeatable).
