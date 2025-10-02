/**
 * API Response Type Definitions
 * Standardized API response formats
 */

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: APIMetadata;
}

export interface APIError {
  code: string;
  message: string;
  details?: string;
  timestamp?: string;
}

export interface APIMetadata {
  timestamp: string;
  cached: boolean;
  cacheAge?: number;
  requestId?: string;
  rateLimit?: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
  error?: APIError;
}

export interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type ErrorCode =
  | 'INVALID_SYMBOL'
  | 'SYMBOL_NOT_FOUND'
  | 'MARKET_CLOSED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_PARAMETERS'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR';
