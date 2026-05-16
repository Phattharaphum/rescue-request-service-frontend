// src\types\api.ts
export interface ApiErrorDetail {
  field?: string;
  issue?: string;
  [key: string]: unknown;
}

export interface ApiError {
  message: string;
  code?: string;
  errorCode?: string;
  traceId?: string;
  requestId?: string;
  timestamp?: string;
  path?: string;
  method?: string;
  details?: ApiErrorDetail[] | Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
}

export interface ApiResponse<T> {
  data: T;
  traceId?: string;
}
