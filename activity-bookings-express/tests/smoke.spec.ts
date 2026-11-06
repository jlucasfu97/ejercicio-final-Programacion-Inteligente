import { test, expect } from '@playwright/test';
import { expectError } from './support/api';

test.describe('Smoke - System endpoints', () => {
  test('GET /health returns 200 with status ok', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  test('GET / returns API identification payload', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok', message: 'ActivityBookings API' });
  });

  test('responses are JSON and allow cross-origin requests (CORS)', async ({ request }) => {
    const response = await request.get('/activities', { headers: { Origin: 'http://localhost:5173' } });
    expect(response.headers()['content-type']).toContain('application/json');
    expect(response.headers()['access-control-allow-origin']).toBe('*');
  });
});

test.describe('Smoke - Error contract', () => {
  test('unknown route returns 404 with standard JSON error', async ({ request }) => {
    const body = await expectError(await request.get('/does-not-exist'), 404);
    expect(body.message).toContain('/does-not-exist');
    expect(body.errors).toEqual([]);
  });

  test('malformed JSON body returns 400 with field "body"', async ({ request }) => {
    const response = await request.post('/login', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"email": "broken"',
    });
    const body = await expectError(response, 400);
    expect(body.message).toBe('Request body must be valid JSON');
    expect(body.errors[0].field).toBe('body');
  });
});
