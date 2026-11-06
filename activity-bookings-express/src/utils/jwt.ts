import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { JWTPayload } from '../types/auth';
import { logger } from './logger';

const TOKEN_EXPIRATION = '24h';

/**
 * Resolves the signing secret from the JWT_SECRET env var.
 * Without it, a random per-process secret is generated (tokens become invalid on restart),
 * instead of falling back to a well-known hardcoded value anyone could use to forge tokens.
 */
function resolveSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim() !== '') {
    return secret;
  }
  logger.warn('JWT', 'JWT_SECRET not set. Using a random secret: tokens will not survive a server restart.');
  return randomBytes(32).toString('hex');
}

const JWT_SECRET = resolveSecret();

/**
 * Generates a JWT token for a user
 */
export function generateToken(userId: string, email: string): string {
  const payload: JWTPayload = { userId, email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION, algorithm: 'HS256' });
}

/**
 * Verifies and decodes a JWT token
 * Returns the payload if valid, throws if invalid, expired or malformed
 */
export function verifyToken(token: string): JWTPayload {
  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    throw new Error('Invalid or expired token');
  }

  if (
    typeof decoded !== 'object' ||
    typeof decoded.userId !== 'string' ||
    typeof decoded.email !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }

  return { userId: decoded.userId, email: decoded.email };
}
