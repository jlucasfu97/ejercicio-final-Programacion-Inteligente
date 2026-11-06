---
name: testing-angular
description: Unit tests (Vitest) and real-browser checks for astrobookings-client. Use when adding client logic or verifying UI acceptance criteria.
---

# Testing the Angular client

## Unit tests (Vitest via `ng test`)
- Location: next to the file, `*.spec.ts`. Run: `npm test -- --watch=false`.
- Test logic, not markup: `toUiError` mappings, `AuthStore` (persist, expiry, logout), interceptor
  (token only for `API_URL`, 401 handling), `safeReturnUrl`.
- HTTP: `provideHttpClient()`, `provideHttpClientTesting()`, `HttpTestingController`.
- Tokens: `fakeToken(expiresInMs)` from `core/auth/testing.ts`. Never import helpers from another `*.spec.ts`
  (Vitest would run that spec twice).

## Browser checks (UI criteria)
1. Start API on a free port with a temp DB: `DB_DIR=<tmp> JWT_SECRET=dev-secret PORT=3000 npm run dev`.
2. Start client: `npx ng serve --port 4300`.
3. Drive headless Chrome with Playwright (`chromium.launch({ channel: 'chrome' })`), one check per criterion,
   screenshots at 1100px and 375px.
4. Ignore console "Failed to load resource" for expected 4xx; fail on any other console error.
5. **Stop both servers** (Windows: `taskkill /PID <root> /T /F`; never kill every `node.exe`).

Put walkthrough scripts in the scratchpad, not in the repo, unless the spec asks for committed E2E tests.
