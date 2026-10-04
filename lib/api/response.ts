import { NextResponse } from 'next/server';

/**
 * 🏛️ Standard Unified API Response Contract
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

/**
 * Success Response Helper
 */
export function successResponse<T>(
  data: T,
  status = 200,
  meta?: Omit<ApiResponseMeta, 'timestamp'>
): NextResponse<ApiResponse<T>> {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  };
  return NextResponse.json(payload, { status });
}

/**
 * Error Response Helper
 */
export function errorResponse(
  message: string,
  statusCode = 400,
  code = 'BAD_REQUEST',
  details?: Record<string, string[] | string>
): NextResponse<ApiResponse<null>> {
  const payload: ApiResponse<null> = {
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
  return NextResponse.json(payload, { status: statusCode });
}

export const sendSuccess = successResponse;
export const sendError = (message: string, code = 'BAD_REQUEST', statusCode = 400, details?: Record<string, string[] | string>) =>
  errorResponse(message, statusCode, code, details);

