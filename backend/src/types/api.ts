export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  meta?: ApiResponseMeta;
  timestamp: string;
}

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
