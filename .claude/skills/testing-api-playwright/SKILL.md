---
name: testing-api-playwright
description: Write and run Playwright API tests for activity-bookings-express that check status, body and persisted data on an isolated DB. Use when adding backend behaviour or verifying API criteria.
---

# Testing the API with Playwright

## Setup (already in place)
- `playwright.config.ts` starts the API on **:3100** with `DB_DIR=tests/.db` and `JWT_SECRET=playwright-test-secret`.
- `tests/support/prepare-db.mjs` copies `db/` into `tests/.db` before the run.
- Helpers: `tests/support/api.ts` (`registerUser`, `createActivity(request, owner, overrides)`, `createBooking`, `auth`, `readDb`, `expectError(res, status)`, `futureDate`, `unique`),
  `tests/support/jwt.ts` (`signJwt`, `decodeJwt`).

## Writing a test
```ts
test('rejects booking above available seats', async ({ request }) => {
  const owner = await registerUser(request);
  const customer = await registerUser(request);
  const activity = await createActivity(request, owner, { maxParticipants: 2 }); // published by default
  const res = await request.post('/bookings', {
    headers: auth(customer.token),
    data: { activityId: activity.id, participants: 3 },
  });
  const body = await expectError(res, 400); // checks { message, errors[] } contract
  expect(body.message).toBe('Capacity exceeded. Available: 2, Requested: 3');
  expect(readDb('bookings').filter((b) => b.activityId === activity.id)).toHaveLength(0);
});
```

## Rules
- Each test creates its own users/activities (unique emails); no ordering between tests.
- Assert three things: status, response body, persisted state (`readDb`).
- Name tests after the criterion they prove; group with `test.describe('<Area> - <topic>')`.
- Mock gateway: amounts that are multiples of 1000 fail payment — use it to test rejections.

## Run
`npm test` · `npx playwright test tests/bookings.spec.ts -g "capacity"` · `npm run test:report` · `npm run typecheck:tests`
