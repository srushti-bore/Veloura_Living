import { ApiResponse, ApiResponseMeta, ApiErrorDetail } from '@/lib/api/response';

export type { ApiResponse, ApiResponseMeta, ApiErrorDetail };

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  category?: string;
  room?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  material?: string;
  color?: string;
  search?: string;
}
