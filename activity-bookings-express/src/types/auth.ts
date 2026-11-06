import { User } from './user';

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Authentication response containing user data and access token
 */
export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    terms: boolean;
  };
  accessToken: string;
}

/**
 * Extended Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
  };
}
