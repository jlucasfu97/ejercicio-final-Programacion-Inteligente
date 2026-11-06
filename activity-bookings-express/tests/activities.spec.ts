import { test, expect } from '@playwright/test';
import {
  ISO_DATE,
  SEED_USER,
  auth,
  createActivity,
  createBooking,
  errorFields,
  expectError,
  readDb,
  registerUser,
  unique,
  validActivity,
} from './support/api';

const STATUSES = ['draft', 'published', 'confirmed', 'sold-out', 'done', 'cancelled'];

/** Checks the full data contract of an activity returned by the API */
function expectActivityShape(activity: Record<string, any>) {
  expect(activity.id).toMatch(/^activity-\d+$/);
  expect(typeof activity.name).toBe('string');
  expect(activity.slug).toMatch(/^[a-z0-9_]+(-[a-z0-9_]+)*$/);
  expect(typeof activity.price).toBe('number');
  expect(activity.price).toBeGreaterThan(0);
  expect(Number.isNaN(Date.parse(activity.date))).toBe(false);
  expect(typeof activity.duration).toBe('number');
  expect(typeof activity.location).toBe('string');
  expect(Number.isInteger(activity.minParticipants)).toBe(true);
  expect(Number.isInteger(activity.maxParticipants)).toBe(true);
  expect(activity.minParticipants).toBeLessThanOrEqual(activity.maxParticipants);
  expect(STATUSES).toContain(activity.status);
  expect(activity.userId).toMatch(/^user-\d+$/);
  expect(activity.createdAt).toMatch(ISO_DATE);
}

test.describe('Activities - Reading data (public)', () => {
  test('GET /activities returns an array of well-formed activities without authentication', async ({ request }) => {
    const response = await request.get('/activities');
    expect(response.status()).toBe(200);
    const activities = await response.json();
    expect(Array.isArray(activities)).toBe(true);
    expect(activities.length).toBeGreaterThanOrEqual(4);
    activities.forEach(expectActivityShape);
  });

  test('GET /activities includes the seed data', async ({ request }) => {
    const activities: any[] = await (await request.get('/activities')).json();
    const ids = activities.map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(['activity-1', 'activity-2', 'activity-3', 'activity-4']));
    const cooking = activities.find((a) => a.id === 'activity-3');
    expect(cooking).toMatchObject({
      name: 'Cooking Workshop: Italian Cuisine',
      slug: 'cooking-workshop-italian-cuisine',
      status: 'published',
      userId: SEED_USER.id,
    });
  });

  test('GET /activities/:id returns the same data as the list', async ({ request }) => {
    const list: any[] = await (await request.get('/activities')).json();
    const response = await request.get('/activities/activity-2');
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(list.find((a) => a.id === 'activity-2'));
  });

  test('GET /activities/:id returns 404 for unknown id', async ({ request }) => {
    const body = await expectError(await request.get('/activities/activity-999999'), 404);
    expect(body.message).toBe('Activity not found');
  });

  test('q searches name, location and slug, case-insensitively', async ({ request }) => {
    const owner = await registerUser(request);
    const marker = unique('zeta').toLowerCase();
    const byLocation = await createActivity(request, owner, { location: `Spaceport ${marker}` });

    const response = await request.get(`/activities?q=${encodeURIComponent(marker.toUpperCase())}`);
    expect(response.status()).toBe(200);
    const results: any[] = await response.json();
    expect(results.map((a) => a.id)).toContain(byLocation.id);
    for (const a of results) {
      expect(`${a.name} ${a.location} ${a.slug}`.toLowerCase()).toContain(marker);
    }
  });

  test('slug filter returns only exact matches', async ({ request }) => {
    const response = await request.get('/activities?slug=city-bike-tour');
    const results: any[] = await response.json();
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('activity-2');
  });

  test('_sort=price&_order=desc returns prices in descending order', async ({ request }) => {
    const results: any[] = await (await request.get('/activities?_sort=price&_order=desc')).json();
    const prices = results.map((a) => a.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('_sort=date returns dates in ascending order by default', async ({ request }) => {
    const results: any[] = await (await request.get('/activities?_sort=date')).json();
    const dates = results.map((a) => Date.parse(a.date));
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  test('repeated query params do not crash the server', async ({ request }) => {
    const response = await request.get('/activities?q=a&q=b');
    expect(response.status()).toBe(200);
  });
});

test.describe('Activities - Creating data (POST /activities)', () => {
  test('returns 201 with generated id, slug, owner and timestamps', async ({ request }) => {
    const owner = await registerUser(request);
    const suffix = unique('m');
    const input = validActivity({ name: `Lunar Flyby: Mission #1! ${suffix}`, price: 1999.99, maxParticipants: 4 });

    const response = await request.post('/activities', { headers: auth(owner.token), data: input });
    expect(response.status()).toBe(201);
    const activity = await response.json();

    expectActivityShape(activity);
    expect(activity).toMatchObject({
      name: input.name,
      price: 1999.99,
      date: input.date,
      duration: input.duration,
      location: input.location,
      minParticipants: 1,
      maxParticipants: 4,
      status: 'published',
      userId: owner.id,
    });
    expect(activity.slug).toBe(`lunar-flyby-mission-1-${suffix}`);
    expect(activity.updatedAt).toBeUndefined();
  });

  test('applies defaults: duration 60 and status draft', async ({ request }) => {
    const owner = await registerUser(request);
    const input = validActivity();
    delete input.duration;
    delete input.status;

    const response = await request.post('/activities', { headers: auth(owner.token), data: input });
    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject({ duration: 60, status: 'draft' });
  });

  test('normalizes numeric strings into numbers', async ({ request }) => {
    const owner = await registerUser(request);
    const activity = await createActivity(request, owner, {
      price: '75.5',
      duration: '45',
      minParticipants: '2',
      maxParticipants: '8',
    });
    expect(activity).toMatchObject({ price: 75.5, duration: 45, minParticipants: 2, maxParticipants: 8 });
  });

  test('created activity is persisted and readable through the API', async ({ request }) => {
    const owner = await registerUser(request);
    const created = await createActivity(request, owner);

    const fetched = await (await request.get(`/activities/${created.id}`)).json();
    expect(fetched).toEqual(created);
    expect(readDb('activities').find((a) => a.id === created.id)).toEqual(created);
  });

  test('new ids never overwrite existing activities', async ({ request }) => {
    const owner = await registerUser(request);
    const created = await createActivity(request, owner);
    expect(['activity-1', 'activity-2', 'activity-3', 'activity-4']).not.toContain(created.id);
    const seed = await (await request.get('/activities/activity-3')).json();
    expect(seed.name).toBe('Cooking Workshop: Italian Cuisine');
  });

  test('requires authentication', async ({ request }) => {
    await expectError(await request.post('/activities', { data: validActivity() }), 401);
  });
});

test.describe('Activities - Validation on create', () => {
  test('empty body reports every required field', async ({ request }) => {
    const owner = await registerUser(request);
    const body = await expectError(await request.post('/activities', { headers: auth(owner.token), data: {} }), 400);
    expect(errorFields(body).sort()).toEqual(
      ['date', 'location', 'maxParticipants', 'minParticipants', 'name', 'price'].sort()
    );
  });

  const invalidCases: [string, Record<string, unknown>, string][] = [
    ['zero price', { price: 0 }, 'price'],
    ['negative price', { price: -10 }, 'price'],
    ['non-numeric price', { price: 'abc' }, 'price'],
    ['invalid date', { date: 'not-a-date' }, 'date'],
    ['past date', { date: '2020-01-01T00:00:00.000Z' }, 'date'],
    ['zero duration', { duration: 0 }, 'duration'],
    ['blank location', { location: '  ' }, 'location'],
    ['minParticipants below 1', { minParticipants: 0 }, 'minParticipants'],
    ['min greater than max', { minParticipants: 5, maxParticipants: 2 }, 'minParticipants'],
    ['status beyond the initial ones', { status: 'done' }, 'status'],
    ['unknown status', { status: 'flying' }, 'status'],
  ];
  for (const [name, override, field] of invalidCases) {
    test(`rejects ${name} with error on "${field}"`, async ({ request }) => {
      const owner = await registerUser(request);
      const response = await request.post('/activities', { headers: auth(owner.token), data: validActivity(override) });
      const body = await expectError(response, 400);
      expect(errorFields(body)).toContain(field);
    });
  }

  test('accepts min equal to max participants (boundary)', async ({ request }) => {
    const owner = await registerUser(request);
    const activity = await createActivity(request, owner, { minParticipants: 3, maxParticipants: 3 });
    expect(activity.maxParticipants).toBe(3);
  });
});

test.describe('Activities - Updating data (PUT /activities/:id)', () => {
  test('owner updates fields; slug and updatedAt are recalculated, createdAt kept', async ({ request }) => {
    const owner = await registerUser(request);
    const created = await createActivity(request, owner);
    const newName = `Mars Orbit ${unique('u')}`;

    const response = await request.put(`/activities/${created.id}`, {
      headers: auth(owner.token),
      data: { name: newName, price: 120 },
    });
    expect(response.status()).toBe(200);
    const updated = await response.json();
    expect(updated).toMatchObject({ name: newName, price: 120, createdAt: created.createdAt });
    expect(updated.slug).toBe(newName.toLowerCase().replace(/\s+/g, '-'));
    expect(updated.updatedAt).toMatch(ISO_DATE);
    expect(await (await request.get(`/activities/${created.id}`)).json()).toEqual(updated);
  });

  test('protected fields (id, userId, slug, createdAt) cannot be overwritten', async ({ request }) => {
    const owner = await registerUser(request);
    const created = await createActivity(request, owner);

    const response = await request.put(`/activities/${created.id}`, {
      headers: auth(owner.token),
      data: { id: 'hacked', userId: 'user-999', slug: 'hacked', createdAt: '1999-01-01T00:00:00.000Z', price: 77 },
    });
    expect(response.status()).toBe(200);
    const updated = await response.json();
    expect(updated).toMatchObject({ id: created.id, userId: owner.id, slug: created.slug, createdAt: created.createdAt, price: 77 });
  });

  test('status cannot be changed through PUT', async ({ request }) => {
    const owner = await registerUser(request);
    const created = await createActivity(request, owner);
    const response = await request.put(`/activities/${created.id}`, { headers: auth(owner.token), data: { status: 'done' } });
    expect(errorFields(await expectError(response, 400))).toEqual(['status']);
  });

  test('rejects wrongly typed values', async ({ request }) => {
    const owner = await registerUser(request);
    const created = await createActivity(request, owner);
    const response = await request.put(`/activities/${created.id}`, {
      headers: auth(owner.token),
      data: { price: '10', duration: -5 },
    });
    expect(errorFields(await expectError(response, 400)).sort()).toEqual(['duration', 'price']);
  });

  test('non-owner gets 403 even when sending invalid data', async ({ request }) => {
    const owner = await registerUser(request);
    const stranger = await registerUser(request);
    const created = await createActivity(request, owner);
    const response = await request.put(`/activities/${created.id}`, { headers: auth(stranger.token), data: { price: -1 } });
    await expectError(response, 403);
  });

  test('maxParticipants cannot go below seats already booked', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const created = await createActivity(request, owner, { maxParticipants: 10 });
    await createBooking(request, customer, created.id, 4);

    const below = await request.put(`/activities/${created.id}`, { headers: auth(owner.token), data: { maxParticipants: 3 } });
    const body = await expectError(below, 400);
    expect(body.errors).toEqual([
      { field: 'maxParticipants', message: 'Max participants cannot be lower than the 4 seats already booked' },
    ]);

    const equal = await request.put(`/activities/${created.id}`, { headers: auth(owner.token), data: { maxParticipants: 4 } });
    expect(equal.status()).toBe(200);
  });

  test('unknown activity returns 404', async ({ request }) => {
    const owner = await registerUser(request);
    await expectError(await request.put('/activities/activity-999999', { headers: auth(owner.token), data: { price: 1 } }), 404);
  });
});

test.describe('Activities - Deleting data (DELETE /activities/:id)', () => {
  test('owner deletes an activity without bookings: 204 and data removed', async ({ request }) => {
    const owner = await registerUser(request);
    const created = await createActivity(request, owner);

    const response = await request.delete(`/activities/${created.id}`, { headers: auth(owner.token) });
    expect(response.status()).toBe(204);
    expect(await response.text()).toBe('');
    await expectError(await request.get(`/activities/${created.id}`), 404);
    expect(readDb('activities').some((a) => a.id === created.id)).toBe(false);
  });

  test('activity with bookings cannot be deleted (409) and stays intact', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const created = await createActivity(request, owner);
    await createBooking(request, customer, created.id, 1);

    await expectError(await request.delete(`/activities/${created.id}`, { headers: auth(owner.token) }), 409);
    expect((await request.get(`/activities/${created.id}`)).status()).toBe(200);
    expect((await request.get('/bookings', { headers: auth(customer.token) })).status()).toBe(200);
  });

  test('non-owner gets 403 and unknown id gets 404', async ({ request }) => {
    const owner = await registerUser(request);
    const stranger = await registerUser(request);
    const created = await createActivity(request, owner);
    await expectError(await request.delete(`/activities/${created.id}`, { headers: auth(stranger.token) }), 403);
    await expectError(await request.delete('/activities/activity-999999', { headers: auth(owner.token) }), 404);
  });
});

test.describe('Activities - Status lifecycle (PATCH /activities/:id/status)', () => {
  test('follows draft -> published -> confirmed -> done, updating status and updatedAt', async ({ request }) => {
    const owner = await registerUser(request);
    const created = await createActivity(request, owner, { status: 'draft' });

    for (const status of ['published', 'confirmed', 'done']) {
      const response = await request.patch(`/activities/${created.id}/status`, { headers: auth(owner.token), data: { status } });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.status).toBe(status);
      expect(body.updatedAt).toMatch(ISO_DATE);
    }
    expect((await (await request.get(`/activities/${created.id}`)).json()).status).toBe('done');
  });

  test('published -> sold-out -> confirmed is allowed', async ({ request }) => {
    const owner = await registerUser(request);
    const created = await createActivity(request, owner);
    for (const status of ['sold-out', 'confirmed']) {
      const response = await request.patch(`/activities/${created.id}/status`, { headers: auth(owner.token), data: { status } });
      expect(response.status()).toBe(200);
    }
  });

  test('invalid transition returns 400 listing the valid ones', async ({ request }) => {
    const owner = await registerUser(request);
    const created = await createActivity(request, owner, { status: 'draft' });
    const response = await request.patch(`/activities/${created.id}/status`, { headers: auth(owner.token), data: { status: 'done' } });
    const body = await expectError(response, 400);
    expect(body.message).toBe('Invalid status transition from draft to done. Valid transitions are: published');
  });

  test('terminal states cannot transition', async ({ request }) => {
    const owner = await registerUser(request);
    const created = await createActivity(request, owner);
    await request.patch(`/activities/${created.id}/status`, { headers: auth(owner.token), data: { status: 'cancelled' } });
    const response = await request.patch(`/activities/${created.id}/status`, { headers: auth(owner.token), data: { status: 'published' } });
    expect((await expectError(response, 400)).message).toContain('none (terminal state)');
  });

  test('unknown status value and missing status return 400', async ({ request }) => {
    const owner = await registerUser(request);
    const created = await createActivity(request, owner);
    await expectError(await request.patch(`/activities/${created.id}/status`, { headers: auth(owner.token), data: { status: 'flying' } }), 400);
    await expectError(await request.patch(`/activities/${created.id}/status`, { headers: auth(owner.token), data: {} }), 400);
  });

  test('non-owner gets 403', async ({ request }) => {
    const owner = await registerUser(request);
    const stranger = await registerUser(request);
    const created = await createActivity(request, owner);
    await expectError(
      await request.patch(`/activities/${created.id}/status`, { headers: auth(stranger.token), data: { status: 'confirmed' } }),
      403
    );
  });
});
