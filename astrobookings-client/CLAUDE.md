# Client — Claude instructions

Angular **22.2** web client for the AstroBookings API. See `README.md` for screens and routes.

## Commands

```bash
npm start                      # dev server :4200 (use `npx ng serve --port 4300` if busy)
npm run build                  # production build
npm test -- --watch=false      # Vitest unit tests
```

The API must run on `http://localhost:3000` (`JWT_SECRET=dev-secret npm run dev` in the backend).

## Architecture

```text
src/app/
├── core/            # API_URL token, models, labels, api-errors (toUiError), bookings-api
│   └── auth/        # AuthStore (signals + localStorage), interceptor, guards, testing helpers
├── shared/          # presentational pieces (FieldErrors)
└── features/<area>/ # one folder per area; one component per screen, lazy routes
```

## Conventions (non-negotiable)

- Standalone components, zoneless, `ChangeDetectionStrategy.OnPush`, `inject()` — no constructors for DI.
- State: signals / `computed` / `linkedSignal`. No RxJS subjects for state.
- Reads: `httpResource`. Writes: `HttpClient` inside the form `submission` action.
- Forms: **Signal Forms** (`form()`, `[formField]`, `[formRoot]`). Validation rules go in the schema
  (`required`, `email`, `minLength`, `min`, `max`, `validate`). Do **not** put `min`/`max`/`required`
  HTML attributes on `[formField]` elements (error NG8022).
- Templates: `@if` / `@for` / `@let`; no `*ngIf`. Route params via `input()` (`withComponentInputBinding`).
- All backend error messages go through `toUiError()` in `core/api-errors.ts` and are shown in Spanish.
  A new backend message ⇒ new mapping + unit test.
- Auth: only `AuthStore` touches `localStorage`. The interceptor adds the token only to `API_URL` requests
  and handles 401 by logging out and redirecting to `/login?returnUrl=…&expired=1`.
- Styling: plain CSS with the variables in `styles.css` (light/dark). No UI libraries. Must work at 375px.
- UI text in Spanish; code in English.

## Tests

- Unit (Vitest): pure logic and services — `api-errors`, `auth-store`, `auth-interceptor`, `return-url`.
  Use `fakeToken()` from `core/auth/testing.ts`; never import helpers from a `*.spec.ts`.
- End-to-end checks in a real browser against the real API for every user-visible criterion.

Use the `coding-angular` and `testing-angular` skills.
