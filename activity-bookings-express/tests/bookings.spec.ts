import { test, expect } from '@playwright/test';
import {
  ISO_DATE,
  auth,
  createActivity,
  createBooking,
  errorFields,
  expectError,
  readDb,
  registerUser,
} from './support/api';

test.describe('Bookings - Creating data (POST /bookings)', () => {
  test('returns 201 with booking data linked to user, activity and payment', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const activity = await createActivity(request, owner);

    const response = await request.post('/bookings', {
      headers: auth(customer.token),
      data: { activityId: activity.id, participants: 3 },
    });
    expect(response.status()).toBe(201);
    const booking = await response.json();

    expect(Object.keys(booking).sort()).toEqual(
      ['activityId', 'createdAt', 'id', 'participants', 'paymentId', 'paymentStatus', 'userId'].sort()
    );
    expect(booking.id).toMatch(/^booking-\d+$/);
    expect(booking).toMatchObject({
      activityId: activity.id,
      userId: customer.id,
      participants: 3,
      paymentStatus: 'paid',
    });
    expect(booking.paymentId).toMatch(/^payment-\d+$/);
    expect(booking.createdAt).toMatch(ISO_DATE);
  });

  test('userId always comes from the token, not from the body', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const activity = await createActivity(request, owner);
    const response = await request.post('/bookings', {
      headers: auth(customer.token),
      data: { activityId: activity.id, participants: 1, userId: owner.id },
    });
    expect((await response.json()).userId).toBe(customer.id);
  });

  test('persists booking and a payment charging price x participants', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const activity = await createActivity(request, owner, { price: 49.5 });
    const booking = await createBooking(request, customer, activity.id, 4);

    expect(readDb('bookings').find((b) => b.id === booking.id)).toEqual(booking);

    const payment = readDb('payments').find((p) => p.id === booking.paymentId);
    expect(payment).toMatchObject({ bookingId: booking.id, amount: 198, status: 'paid' });
    expect(payment.createdAt).toMatch(ISO_DATE);
  });

  test('requires authentication', async ({ request }) => {
    await expectError(await request.post('/bookings', { data: { activityId: 'activity-2', participants: 1 } }), 401);
  });
});

test.describe('Bookings - Validation', () => {
  test('empty body reports activityId and participants', async ({ request }) => {
    const customer = await registerUser(request);
    const body = await expectError(await request.post('/bookings', { headers: auth(customer.token), data: {} }), 400);
    expect(errorFields(body).sort()).toEqual(['activityId', 'participants']);
  });

  for (const participants of [0, -1, 1.5, '2', null]) {
    test(`rejects participants = ${JSON.stringify(participants)}`, async ({ request }) => {
      const owner = await registerUser(request);
      const customer = await registerUser(request);
      const activity = await createActivity(request, owner);
      const response = await request.post('/bookings', {
        headers: auth(customer.token),
        data: { activityId: activity.id, participants },
      });
      expect(errorFields(await expectError(response, 400))).toEqual(['participants']);
    });
  }

  test('unknown activity returns 404', async ({ request }) => {
    const customer = await registerUser(request);
    const response = await request.post('/bookings', {
      headers: auth(customer.token),
      data: { activityId: 'activity-999999', participants: 1 },
    });
    expect((await expectError(response, 404)).message).toBe('Activity not found');
  });
});

test.describe('Bookings - Business rules', () => {
  test('capacity: accepts up to the limit and reports remaining seats when exceeded', async ({ request }) => {
    const owner = await registerUser(request);
    const customerA = await registerUser(request);
    const customerB = await registerUser(request);
    const activity = await createActivity(request, owner, { maxParticipants: 3 });

    await createBooking(request, customerA, activity.id, 2);
    const exceeded = await request.post('/bookings', {
      headers: auth(customerB.token),
      data: { activityId: activity.id, participants: 2 },
    });
    expect((await expectError(exceeded, 400)).message).toBe('Capacity exceeded. Available: 1, Requested: 2');

    await createBooking(request, customerB, activity.id, 1);
    const full = await request.post('/bookings', {
      headers: auth(customerA.token),
      data: { activityId: activity.id, participants: 1 },
    });
    expect((await expectError(full, 400)).message).toBe('Capacity exceeded. Available: 0, Requested: 1');
  });

  test('draft activities cannot be booked', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const activity = await createActivity(request, owner, { status: 'draft' });
    const response = await request.post('/bookings', { headers: auth(customer.token), data: { activityId: activity.id, participants: 1 } });
    expect((await expectError(response, 400)).message).toBe('Activity is not open for bookings (status: draft)');
  });

  test('cancelled activities cannot be booked', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const activity = await createActivity(request, owner);
    await request.patch(`/activities/${activity.id}/status`, { headers: auth(owner.token), data: { status: 'cancelled' } });
    const response = await request.post('/bookings', { headers: auth(customer.token), data: { activityId: activity.id, participants: 1 } });
    expect((await expectError(response, 400)).message).toBe('Activity is not open for bookings (status: cancelled)');
  });

  test('confirmed activities can still be booked', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const activity = await createActivity(request, owner);
    await request.patch(`/activities/${activity.id}/status`, { headers: auth(owner.token), data: { status: 'confirmed' } });
    await createBooking(request, customer, activity.id, 1);
  });

  test('owner cannot book their own activity', async ({ request }) => {
    const owner = await registerUser(request);
    const activity = await createActivity(request, owner);
    const response = await request.post('/bookings', { headers: auth(owner.token), data: { activityId: activity.id, participants: 1 } });
    expect((await expectError(response, 400)).message).toBe(
      'Activity is not open for bookings (you cannot book your own activity)'
    );
  });

  test('failed payment returns 402 and stores neither booking nor seats', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    // Mock gateway deterministically rejects amounts multiple of 1000
    const activity = await createActivity(request, owner, { price: 100, maxParticipants: 10 });

    const response = await request.post('/bookings', {
      headers: auth(customer.token),
      data: { activityId: activity.id, participants: 10 },
    });
    expect((await expectError(response, 402)).message).toBe('Payment could not be processed');

    expect(readDb('bookings').some((b) => b.activityId === activity.id)).toBe(false);
    const mine = await (await request.get(`/bookings?activityId=${activity.id}`, { headers: auth(customer.token) })).json();
    expect(mine).toEqual([]);
    // seats were not consumed
    await createBooking(request, customer, activity.id, 9);
  });
});

test.describe('Bookings - Reading data (GET /bookings, GET /bookings/:id)', () => {
  test('list returns only the authenticated user bookings, enriched with activity data', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const other = await registerUser(request);
    const activity = await createActivity(request, owner, { price: 30, duration: 120 });
    const booking = await createBooking(request, customer, activity.id, 2);
    await createBooking(request, other, activity.id, 1);

    const response = await request.get('/bookings', { headers: auth(customer.token) });
    expect(response.status()).toBe(200);
    const list: any[] = await response.json();

    expect(list).toHaveLength(1);
    expect(list[0]).toEqual({
      ...booking,
      activity: {
        name: activity.name,
        slug: activity.slug,
        price: 30,
        date: activity.date,
        duration: 120,
        location: activity.location,
        status: 'published',
      },
    });
  });

  test('a new user starts with an empty list', async ({ request }) => {
    const customer = await registerUser(request);
    expect(await (await request.get('/bookings', { headers: auth(customer.token) })).json()).toEqual([]);
  });

  test('activityId query filters the list', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const first = await createActivity(request, owner);
    const second = await createActivity(request, owner);
    await createBooking(request, customer, first.id, 1);
    const target = await createBooking(request, customer, second.id, 1);

    const list: any[] = await (await request.get(`/bookings?activityId=${second.id}`, { headers: auth(customer.token) })).json();
    expect(list.map((b) => b.id)).toEqual([target.id]);
  });

  test('GET /bookings/:id returns the same enriched data as the list', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const activity = await createActivity(request, owner);
    const booking = await createBooking(request, customer, activity.id, 1);

    const list: any[] = await (await request.get('/bookings', { headers: auth(customer.token) })).json();
    const response = await request.get(`/bookings/${booking.id}`, { headers: auth(customer.token) });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(list[0]);
  });

  test('enriched activity status reflects later lifecycle changes', async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const activity = await createActivity(request, owner);
    const booking = await createBooking(request, customer, activity.id, 1);
    await request.patch(`/activities/${activity.id}/status`, { headers: auth(owner.token), data: { status: 'confirmed' } });

    const fetched = await (await request.get(`/bookings/${booking.id}`, { headers: auth(customer.token) })).json();
    expect(fetched.activity.status).toBe('confirmed');
  });

  test("another user's booking is reported as not found (404), not forbidden", async ({ request }) => {
    const owner = await registerUser(request);
    const customer = await registerUser(request);
    const snoop = await registerUser(request);
    const activity = await createActivity(request, owner);
    const booking = await createBooking(request, customer, activity.id, 1);

    const body = await expectError(await request.get(`/bookings/${booking.id}`, { headers: auth(snoop.token) }), 404);
    expect(body.message).toBe('Booking not found');
  });

  test('unknown booking id returns 404', async ({ request }) => {
    const customer = await registerUser(request);
    await expectError(await request.get('/bookings/booking-999999', { headers: auth(customer.token) }), 404);
  });

  test('requires authentication', async ({ request }) => {
    await expectError(await request.get('/bookings/booking-1'), 401);
  });
});
