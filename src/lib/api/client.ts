import { API_BASE_URL } from '@/lib/config/env';
import { ApiError } from '@/types/api';

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly error: ApiError,
    public readonly traceId?: string,
  ) {
    super(error.message);
    this.name = 'ApiRequestError';
  }
}

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  params?: Record<string, string | number | boolean | undefined>;
}

function buildQueryString(
  params?: Record<string, string | number | boolean | undefined>,
): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null,
  );
  if (!entries.length) return '';
  return (
    '?' +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
  );
}

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = `${API_BASE_URL}${normalizedPath}${buildQueryString(options?.params)}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options?.signal,
    cache: 'no-store',
  });

  const traceId = res.headers.get('x-trace-id') ?? undefined;

  if (!res.ok) {
    let errorBody: ApiError = { message: `HTTP ${res.status}` };
    try {
      errorBody = (await res.json()) as ApiError;
    } catch {
      // Use default error body
    }
    throw new ApiRequestError(res.status, errorBody, traceId);
  }

  if (res.status === 204) return undefined as T;

  const data: T = (await res.json()) as T;
  return data;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};
