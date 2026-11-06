/**
 * Validation error for a specific field
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Standard error response format
 * All error responses must follow this structure
 */
export interface ErrorResponse {
  message: string;
  errors: ValidationError[];
}
