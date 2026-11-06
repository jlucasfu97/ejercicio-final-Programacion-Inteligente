import { APIRequestContext, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Data folder used by the test server (see playwright.config.ts) */
export const TEST_DB_DIR = 'tests/.db';

/** Seed user shipped in db/users.json (password stored in plain text, migrated on login) */
export const SEED_USER = { id: 'user-1', email: 'm@f.c', password: '1234aB' };

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

let counter = 0;
/** Unique suffix so parallel tests never collide */
export function unique(prefix = 'test'): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${process.pid}-${counter}`;
}

/** ISO date `days` in the future */
export function futureDate(days = 30): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function auth(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export interface TestUser {
  id: string;
  email: string;
  password: string;
  username: string;
  token: string;
}

/** Registers a brand new user and returns its credentials + token */
export async function registerUser(request: APIRequestContext): Promise<TestUser> {
  const email = `${unique('user')}@example.com`;
  const password = 'secret123';
  const username = unique('name');
  const response = await request.post('/users', { data: { username, email, password, terms: true } });
  expect(response.status(), await response.text()).toBe(201);
  const body = await response.json();
  return { id: `user-${body.user.id}`, email, password, username, token: body.accessToken };
}

export function validActivity(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: unique('Activity'),
    price: 50,
    date: futureDate(),
    duration: 90,
    location: 'Cape Canaveral',
    minParticipants: 1,
    maxParticipants: 10,
    status: 'published',
    ...overrides,
  };
}

/** Creates an activity owned by `owner` (published by default) */
export async function createActivity(
  request: APIRequestContext,
  owner: TestUser,
  overrides: Record<string, unknown> = {}
): Promise<Record<string, any>> {
  const response = await request.post('/activities', { headers: auth(owner.token), data: validActivity(overrides) });
  expect(response.status(), await response.text()).toBe(201);
  return response.json();
}

/** Creates a booking for `user` and returns the created booking */
export async function createBooking(
  request: APIRequestContext,
  user: TestUser,
  activityId: string,
  participants = 1
): Promise<Record<string, any>> {
  const response = await request.post('/bookings', { headers: auth(user.token), data: { activityId, participants } });
  expect(response.status(), await response.text()).toBe(201);
  return response.json();
}

/** Reads a JSON collection persisted by the test server */
export function readDb<T = any>(file: 'users' | 'activities' | 'bookings' | 'payments'): T[] {
  return JSON.parse(readFileSync(join(TEST_DB_DIR, `${file}.json`), 'utf-8')) as T[];
}

/** Asserts the standard error contract: { message: string, errors: {field,message}[] } */
export async function expectError(response: Awaited<ReturnType<APIRequestContext['get']>>, status: number) {
  expect(response.status()).toBe(status);
  const body = await response.json();
  expect(typeof body.message).toBe('string');
  expect(Array.isArray(body.errors)).toBe(true);
  for (const error of body.errors) {
    expect(typeof error.field).toBe('string');
    expect(typeof error.message).toBe('string');
  }
  return body as { message: string; errors: { field: string; message: string }[] };
}

/** Field names reported in a validation error response */
export function errorFields(body: { errors: { field: string }[] }): string[] {
  return body.errors.map((e) => e.field);
}
