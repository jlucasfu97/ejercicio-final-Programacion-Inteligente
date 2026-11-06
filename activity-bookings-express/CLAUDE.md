# Backend — Claude instructions

@AGENTS.md

## Additions for this copy (v1.10.1+)

- Services are singletons built in `src/container.ts` **after** `loadAllData()`. Routes import services from
  the container; never `new XService()` inside a route module (that was the root cause of the login/ID bugs).
- `src/index.ts` imports `./container` first. Keep it first.
- JWT: `src/utils/jwt.ts`. Secret from `JWT_SECRET` (random per process otherwise), HS256 pinned on sign and
  verify, payload shape validated. The middleware requires `Bearer` and checks the user still exists.
- Passwords: `src/utils/password.ts` (scrypt, `scrypt$salt$hash`, legacy plain text migrated on login).
- Business rules live in services and are documented in `README.md` → "Booking rules". Update both together.
- Error contract: every error is JSON `{ message, errors: [{ field, message }] }`; 400 validation, 401 auth, 403 not owner,
  404 missing, 409 conflict, 500 unexpected.
- Older specs live in `specs/` (course history). New specs go in `../docs/specs/`.

## Tests

- `npm test` runs Playwright API tests on port 3100 against `tests/.db` (copied by `tests/support/prepare-db.mjs`).
- Helpers in `tests/support/api.ts` (`registerUser`, `createActivity`, `createBooking`, `readDb`, `expectError`).
- Every new rule gets a test in the matching file: `users`, `activities`, `bookings`, `smoke`.
- Check both the HTTP response **and** what was persisted (`readDb`).

Use the `coding-express-api` and `testing-api-playwright` skills.
