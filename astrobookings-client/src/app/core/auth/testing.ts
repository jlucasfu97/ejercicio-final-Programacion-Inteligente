/** Test helper: builds an unsigned JWT-like token with the given expiration (ms from now) */
export function fakeToken(expiresInMs: number): string {
  const payload = btoa(JSON.stringify({ userId: 'user-7', exp: Math.floor((Date.now() + expiresInMs) / 1000) }));
  return `header.${payload}.signature`;
}
