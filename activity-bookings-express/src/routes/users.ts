import { Request, Response, Router } from 'express';
import { generateToken } from '../utils/jwt';
import { AuthResponse } from '../types/auth';
import { CreateUserRequest } from '../types/user';
import { ErrorResponse } from '../types/error';
import { logger } from '../utils/logger';

const router = Router();
import { userService } from '../container';

/**
 * POST /users
 * Registers a new user
 * Returns 201 on success, 400 on validation error
 */
router.post('/', (req: Request, res: Response) => {
  const errors = userService.validateRegister(req.body);
  if (errors.length > 0) {
    const errorResponse: ErrorResponse = {
      message: 'Validation failed',
      errors,
    };
    return res.status(400).json(errorResponse);
  }

  try {
    const user = userService.create(req.body as CreateUserRequest);
    const response: AuthResponse = {
      user: {
        id: parseInt(user.id.replace('user-', ''), 10) || 0,
        username: user.username,
        email: user.email,
        terms: user.terms,
      },
      accessToken: generateToken(user.id, user.email),
    };
    res.status(201).json(response);
  } catch (error) {
    logger.error('UserRoute', 'Failed to register user', error);
    const errorResponse: ErrorResponse = {
      message: error instanceof Error && error.message === 'Email already registered'
        ? 'Email is already registered'
        : 'Failed to register user',
      errors: error instanceof Error && error.message === 'Email already registered'
        ? [{ field: 'email', message: 'Email is already registered' }]
        : [],
    };
    res.status(400).json(errorResponse);
  }
});

export default router;
