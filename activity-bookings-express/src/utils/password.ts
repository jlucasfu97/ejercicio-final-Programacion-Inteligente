import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const PREFIX = 'scrypt';
const KEY_LENGTH = 64;

/**
 * Hashes a password with scrypt and a random salt.
 * Format: scrypt$<salt hex>$<hash hex>
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${PREFIX}$${salt}$${hash}`;
}

/**
 * Returns true if the stored value is a hash produced by hashPassword
 */
export function isHashed(stored: string): boolean {
  return stored.startsWith(`${PREFIX}$`);
}

/**
 * Compares a plain password against a stored hash in constant time
 */
export function verifyPassword(password: string, stored: string): boolean {
  const [prefix, salt, hashHex] = stored.split('$');
  if (prefix !== PREFIX || !salt || !hashHex) {
    return false;
  }
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
