/**
 * Error Handler Utilities
 * Standardized error responses for API
 */

import { APIResponse, APIError, ErrorCode } from '../types/api';

export class APIErrorHandler {
  /**
   * Create standardized error response
   */
  static createErrorResponse<T>(
    code: ErrorCode,
    message: string,
    details?: string
  ): APIResponse<T> {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Create success response
   */
  static createSuccessResponse<T>(
    data: T,
    cached: boolean = false,
    cacheAge?: number
  ): APIResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        cached,
        cacheAge,
      },
    };
  }

  /**
   * Handle unknown errors
   */
  static handleUnknownError(error: unknown): APIError {
    console.error('Unknown error:', error);
    
    if (error instanceof Error) {
      return {
        code: 'INTERNAL_ERROR',
        message: 'An internal error occurred',
        details: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      code: 'INTERNAL_ERROR',
      message: 'An unknown error occurred',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Rate limit error class
 */
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}
