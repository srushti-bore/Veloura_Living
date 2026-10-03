/**
 * 🏛️ Standard Unified API Response Protocol
 * Defined in SRS Section 45, 46, 53
 */

export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  timestamp: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, string[] | string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiErrorDetail;
  meta?: ApiResponseMeta;
}

export function formatSuccessResponse<T>(
  data: T,
  meta?: Omit<ApiResponseMeta, 'timestamp'>
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  };
}

export function formatErrorResponse(
  message: string,
  code = 'BAD_REQUEST',
  details?: Record<string, string[] | string>
): ApiResponse<null> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}
