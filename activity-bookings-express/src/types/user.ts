/**
 * Domain entity - represents a user as stored in the system
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  terms: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Request DTO for creating a new user (registration)
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  terms: boolean;
}

/**
 * Request DTO for user login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Validation error response format
 * Returned when validation fails (HTTP 400)
 * @deprecated Use ValidationError from '../types/error' instead
 */
export type { ValidationError } from './error';
