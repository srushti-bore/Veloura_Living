import { formatErrorResponse, ApiResponse } from './response';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Record<string, string[] | string>;

  constructor(
    message: string,
    statusCode = 400,
    code = 'APPLICATION_ERROR',
    details?: Record<string, string[] | string>
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Failed', details?: Record<string, string[] | string>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication Required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access Denied: Insufficient Permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Requested Resource Not Found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource Conflict or Concurrency Failure') {
    super(message, 409, 'CONFLICT');
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, details?: Record<string, string[] | string>) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }
}

export function handleBackendError(error: unknown): { statusCode: number; response: ApiResponse<null> } {
  console.error('[Backend Error Handler]:', error);

  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      response: formatErrorResponse(error.message, error.code, error.details),
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      response: formatErrorResponse(error.message, 'INTERNAL_SERVER_ERROR'),
    };
  }

  return {
    statusCode: 500,
    response: formatErrorResponse('An unexpected error occurred', 'INTERNAL_SERVER_ERROR'),
  };
}
