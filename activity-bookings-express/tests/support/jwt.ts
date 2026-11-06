import { createHmac } from 'node:crypto';

/** Secret configured for the test server in playwright.config.ts */
export const TEST_JWT_SECRET = 'playwright-test-secret';

const b64url = (value: object | string): string =>
  Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');

/** Hand-made HS256 JWT, used to craft forged / expired / tampered tokens */
export function signJwt(payload: Record<string, unknown>, secret = TEST_JWT_SECRET, alg = 'HS256'): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url({ alg, typ: 'JWT' });
  const body = b64url({ iat: now, exp: now + 3600, ...payload });
  if (alg === 'none') {
    return `${header}.${body}.`;
  }
  const signature = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

/** Decodes (without verifying) the payload of a JWT */
export function decodeJwt(token: string): Record<string, any> {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'));
}
