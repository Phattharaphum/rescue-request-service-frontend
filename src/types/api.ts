// src\types\api.ts
export interface ApiError {
  message: string;
  code?: string;
  traceId?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
}

export interface ApiResponse<T> {
  data: T;
  traceId?: string;
}
