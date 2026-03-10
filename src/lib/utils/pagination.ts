export function buildCursorParams(cursor?: string, limit?: number): URLSearchParams {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  if (limit !== undefined) params.set('limit', String(limit));
  return params;
}

export function hasNextPage(nextCursor?: string): boolean {
  return !!nextCursor;
}
