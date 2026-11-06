import { test, expect } from '@playwright/test';
import { ISO_DATE, SEED_USER, auth, errorFields, expectError, readDb, registerUser, unique } from './support/api';
import { decodeJwt, signJwt } from './support/jwt';

test.describe('Users - Registration data (POST /users)', () => {
  test('returns 201 with public user data and access token, never the password', async ({ request }) => {
    const email = `${unique('reg')}@example.com`;
    const response = await request.post('/users', {
      data: { username: 'Ana', email, password: 'secret123', terms: true },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(Object.keys(body).sort()).toEqual(['accessToken', 'user']);
    expect(Object.keys(body.user).sort()).toEqual(['email', 'id', 'terms', 'username']);
    expect(body.user).toMatchObject({ username: 'Ana', email, terms: true });
    expect(Number.isInteger(body.user.id)).toBe(true);
    expect(body.user.id).toBeGreaterThan(0);
    expect(JSON.stringify(body)).not.toContain('secret123');
    expect(body.accessToken.split('.')).toHaveLength(3);
  });

  test('normalizes email to lower case and trims username', async ({ request }) => {
    const local = unique('MiXeD');
    const response = await request.post('/users', {
      data: { username: '  Spaced Name  ', email: `${local}@EXAMPLE.com`, password: 'secret123', terms: true },
    });
    expect(response.status()).toBe(201);
    const { user } = await response.json();
    expect(user.email).toBe(`${local.toLowerCase()}@example.com`);
    expect(user.username).toBe('Spaced Name');
  });

  test('access token carries user id and email and expires in 24h', async ({ request }) => {
    const user = await registerUser(request);
    const payload = decodeJwt(user.token);
    expect(payload.userId).toBe(user.id);
    expect(payload.email).toBe(user.email);
    expect(payload.exp - payload.iat).toBe(24 * 60 * 60);
  });

  test('assigns unique ids and never reuses the seed user id', async ({ request }) => {
    const first = await registerUser(request);
    const second = await registerUser(request);
    expect(first.id).not.toBe(second.id);
    expect([first.id, second.id]).not.toContain(SEED_USER.id);
  });

  test('persists the user with a salted hash instead of the plain password', async ({ request }) => {
    const user = await registerUser(request);
    const stored = readDb('users').find((u) => u.id === user.id);

    expect(stored).toBeDefined();
    expect(stored.email).toBe(user.email);
    expect(stored.username).toBe(user.username);
    expect(stored.terms).toBe(true);
    expect(stored.createdAt).toMatch(ISO_DATE);
    expect(stored.password).not.toBe(user.password);
    expect(stored.password).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  });

  test('registration does not overwrite the seed user', async ({ request }) => {
    await registerUser(request);
    const seed = readDb('users').find((u) => u.id === SEED_USER.id);
    expect(seed?.email).toBe(SEED_USER.email);
  });
});

test.describe('Users - Registration validation', () => {
  test('empty body reports every required field at once', async ({ request }) => {
    const body = await expectError(await request.post('/users', { data: {} }), 400);
    expect(body.message).toBe('Validation failed');
    expect(errorFields(body).sort()).toEqual(['email', 'password', 'terms', 'username']);
  });

  const invalidCases: [string, Record<string, unknown>, string][] = [
    ['blank username', { username: '   ' }, 'username'],
    ['invalid email format', { email: 'not-an-email' }, 'email'],
    ['password shorter than 6 chars', { password: '12345' }, 'password'],
    ['terms not accepted', { terms: false }, 'terms'],
    ['terms sent as string', { terms: 'true' }, 'terms'],
  ];
  for (const [name, override, field] of invalidCases) {
    test(`rejects ${name} with error on "${field}"`, async ({ request }) => {
      const data = { username: 'Ana', email: `${unique('v')}@example.com`, password: 'secret123', terms: true, ...override };
      const body = await expectError(await request.post('/users', { data }), 400);
      expect(errorFields(body)).toEqual([field]);
    });
  }

  test('accepts a password of exactly 6 characters (boundary)', async ({ request }) => {
    const response = await request.post('/users', {
      data: { username: 'Ana', email: `${unique('b')}@example.com`, password: '123456', terms: true },
    });
    expect(response.status()).toBe(201);
  });

  test('rejects duplicated email regardless of case', async ({ request }) => {
    const user = await registerUser(request);
    const response = await request.post('/users', {
      data: { username: 'Other', email: user.email.toUpperCase(), password: 'secret123', terms: true },
    });
    const body = await expectError(response, 400);
    expect(body.errors).toEqual([{ field: 'email', message: 'Email is already registered' }]);
  });
});

test.describe('Users - Login (POST /login)', () => {
  test('returns 200 with the same public data as registration', async ({ request }) => {
    const user = await registerUser(request);
    const response = await request.post('/login', { data: { email: user.email, password: user.password } });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(`user-${body.user.id}`).toBe(user.id);
    expect(body.user).toMatchObject({ email: user.email, username: user.username, terms: true });
    expect(JSON.stringify(body)).not.toContain(user.password);
    expect(decodeJwt(body.accessToken).userId).toBe(user.id);
  });

  test('a freshly registered user can log in immediately, email case-insensitive', async ({ request }) => {
    const user = await registerUser(request);
    const response = await request.post('/login', { data: { email: user.email.toUpperCase(), password: user.password } });
    expect(response.status()).toBe(200);
  });

  test('wrong password and unknown email return the same 401 (no user enumeration)', async ({ request }) => {
    const user = await registerUser(request);
    const wrongPassword = await expectError(
      await request.post('/login', { data: { email: user.email, password: 'wrong-pass' } }),
      401
    );
    const unknownEmail = await expectError(
      await request.post('/login', { data: { email: `${unique('ghost')}@example.com`, password: 'whatever' } }),
      401
    );
    expect(wrongPassword).toEqual({ message: 'Invalid email or password', errors: [] });
    expect(unknownEmail).toEqual(wrongPassword);
  });

  test('missing credentials report both fields', async ({ request }) => {
    const body = await expectError(await request.post('/login', { data: {} }), 400);
    expect(errorFields(body).sort()).toEqual(['email', 'password']);
  });

  test('seed user logs in and its legacy plain-text password gets hashed', async ({ request }) => {
    const response = await request.post('/login', { data: { email: SEED_USER.email, password: SEED_USER.password } });
    expect(response.status()).toBe(200);
    expect((await response.json()).user.id).toBe(1);

    const stored = readDb('users').find((u) => u.id === SEED_USER.id);
    expect(stored.password).toMatch(/^scrypt\$/);

    const again = await request.post('/login', { data: { email: SEED_USER.email, password: SEED_USER.password } });
    expect(again.status()).toBe(200);
  });
});

test.describe('Auth - JWT protection of private endpoints', () => {
  test('valid Bearer token grants access', async ({ request }) => {
    const user = await registerUser(request);
    const response = await request.get('/bookings', { headers: auth(user.token) });
    expect(response.status()).toBe(200);
  });

  test('missing Authorization header returns 401', async ({ request }) => {
    const body = await expectError(await request.get('/bookings'), 401);
    expect(body.message).toContain('Authentication required');
  });

  test('non-Bearer scheme returns 401', async ({ request }) => {
    const user = await registerUser(request);
    await expectError(await request.get('/bookings', { headers: { Authorization: `Basic ${user.token}` } }), 401);
  });

  test('garbage token returns 401', async ({ request }) => {
    await expectError(await request.get('/bookings', { headers: auth('not.a.jwt') }), 401);
  });

  test('token signed with another secret (e.g. old hardcoded default) returns 401', async ({ request }) => {
    const user = await registerUser(request);
    const forged = signJwt({ userId: user.id, email: user.email }, 'development-secret-key-change-in-production');
    await expectError(await request.get('/bookings', { headers: auth(forged) }), 401);
  });

  test('unsigned token (alg: none) returns 401', async ({ request }) => {
    const user = await registerUser(request);
    const unsigned = signJwt({ userId: user.id, email: user.email }, '', 'none');
    await expectError(await request.get('/bookings', { headers: auth(unsigned) }), 401);
  });

  test('expired token returns 401', async ({ request }) => {
    const user = await registerUser(request);
    const past = Math.floor(Date.now() / 1000) - 3600;
    const expired = signJwt({ userId: user.id, email: user.email, iat: past - 60, exp: past });
    await expectError(await request.get('/bookings', { headers: auth(expired) }), 401);
  });

  test('validly signed token for a non-existent user returns 401', async ({ request }) => {
    const ghost = signJwt({ userId: 'user-999999', email: 'ghost@example.com' });
    await expectError(await request.get('/bookings', { headers: auth(ghost) }), 401);
  });

  test('validly signed token with malformed payload returns 401', async ({ request }) => {
    const malformed = signJwt({ sub: 'user-1' });
    await expectError(await request.get('/bookings', { headers: auth(malformed) }), 401);
  });
});
