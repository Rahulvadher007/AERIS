export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface CursorMeta {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CursorResponse<T> {
  data: T[];
  meta: CursorMeta;
}

export interface Advisory {
  id: string;
  message: string;
  severity: string;
  zone?: string;
  city?: string;
  aqi?: number;
  recommendations?: string[];
  createdAt?: string;
}
