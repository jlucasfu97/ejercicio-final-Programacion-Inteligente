import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../types/auth';
import { ErrorResponse } from '../types/error';
import { logger } from '../utils/logger';
import { userService } from '../container';

function unauthorized(res: Response, message: string): void {
  const errorResponse: ErrorResponse = { message, errors: [] };
  res.status(401).json(errorResponse);
}

/**
 * Authentication middleware that validates JWT tokens
 * Expects `Authorization: Bearer <token>`, verifies it and checks the user still exists
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    logger.warn('AuthMiddleware', 'Missing or malformed authorization header');
    unauthorized(res, 'Authentication required. Please provide a valid token.');
    return;
  }

  try {
    const payload = verifyToken(token);
    const user = userService.getById(payload.userId);
    if (!user) {
      logger.warn('AuthMiddleware', 'Token for unknown user', { userId: payload.userId });
      unauthorized(res, 'Invalid or expired token. Please login again.');
      return;
    }
    (req as AuthenticatedRequest).user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    logger.warn('AuthMiddleware', 'Invalid token', error instanceof Error ? error.message : error);
    unauthorized(res, 'Invalid or expired token. Please login again.');
  }
}
