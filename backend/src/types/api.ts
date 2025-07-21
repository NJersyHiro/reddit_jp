export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorCode {
  AUTH_REQUIRED: 'AUTH_REQUIRED';
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS';
  USER_NOT_FOUND: 'USER_NOT_FOUND';
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND';
  THREAD_NOT_FOUND: 'THREAD_NOT_FOUND';
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND';
  PERMISSION_DENIED: 'PERMISSION_DENIED';
  VALIDATION_ERROR: 'VALIDATION_ERROR';
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED';
  SERVER_ERROR: 'SERVER_ERROR';
}

export const ERROR_CODES: ErrorCode = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  THREAD_NOT_FOUND: 'THREAD_NOT_FOUND',
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR: 'SERVER_ERROR',
};