import { apiClient } from '@/lib/api/client';
import {
  RescueRequestCreateInput,
  RescueRequestCreateResponse,
  CitizenTrackingLookupInput,
  CitizenTrackingLookupResponse,
  CitizenStatusResponse,
  CitizenUpdateCreateInput,
  CitizenUpdateCreateResponse,
  CitizenUpdateListResponse,
  RequestDetailResponse,
  PatchRequestInput,
  PatchRequestResponse,
  StatusEvent,
  StatusTransitionResponse,
  CurrentStateSnapshot,
  IncidentRequestsResponse,
  IdempotencyRecordResponse,
  AppendEventInput,
} from '@/types/rescue';
import { PaginatedResponse } from '@/types/api';

interface CursorParams {
  cursor?: string;
  limit?: number;
}

interface RequestDetailParams extends CursorParams {
  includeEvents?: boolean;
  includeCitizenUpdates?: boolean;
  // Backward-compatible alias used by existing callers.
  includeUpdates?: boolean;
}

interface CitizenUpdatesParams extends CursorParams {
  since?: string;
}

interface RequestEventsParams extends CursorParams {
  sinceVersion?: number;
  order?: 'ASC' | 'DESC';
}

interface IncidentRequestsParams extends CursorParams {
  status?: string;
}

interface IdempotencyParams {
  includeResponse?: boolean;
  includeRequestFingerprint?: boolean;
}

function buildMutationHeaders(
  idempotencyKey?: string,
  ifMatch?: string,
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;
  if (ifMatch) headers['If-Match'] = ifMatch;
  return headers;
}

export function createRescueRequest(
  input: RescueRequestCreateInput,
  idempotencyKey?: string,
): Promise<RescueRequestCreateResponse> {
  return apiClient.post<RescueRequestCreateResponse>('/rescue-requests', input, {
    headers: buildMutationHeaders(idempotencyKey),
  });
}

export function lookupTracking(
  input: CitizenTrackingLookupInput,
): Promise<CitizenTrackingLookupResponse> {
  return apiClient.post<CitizenTrackingLookupResponse>(
    '/citizen/tracking/lookup',
    input,
  );
}

export function getCitizenStatus(requestId: string): Promise<CitizenStatusResponse> {
  return apiClient.get<CitizenStatusResponse>(
    `/citizen/rescue-requests/${requestId}/status`,
  );
}

export function createCitizenUpdate(
  requestId: string,
  input: CitizenUpdateCreateInput,
  idempotencyKey?: string,
): Promise<CitizenUpdateCreateResponse> {
  return apiClient.post<CitizenUpdateCreateResponse>(
    `/citizen/rescue-requests/${requestId}/updates`,
    input,
    { headers: buildMutationHeaders(idempotencyKey) },
  );
}

export function listCitizenUpdates(
  requestId: string,
  params?: CitizenUpdatesParams,
): Promise<CitizenUpdateListResponse> {
  return apiClient.get<CitizenUpdateListResponse>(
    `/citizen/rescue-requests/${requestId}/updates`,
    { params: params as Record<string, string | number | boolean | undefined> },
  );
}

export function getRequestDetail(
  requestId: string,
  params?: RequestDetailParams,
): Promise<RequestDetailResponse> {
  const query = {
    ...params,
    includeUpdates: undefined,
    includeCitizenUpdates:
      params?.includeCitizenUpdates ?? params?.includeUpdates,
  };

  return apiClient.get<RequestDetailResponse>(`/rescue-requests/${requestId}`, {
    params: query as Record<string, string | number | boolean | undefined>,
  });
}

export function patchRequest(
  requestId: string,
  input: PatchRequestInput,
  idempotencyKey?: string,
  ifMatch?: string,
): Promise<PatchRequestResponse> {
  return apiClient.patch<PatchRequestResponse>(
    `/rescue-requests/${requestId}`,
    input,
    { headers: buildMutationHeaders(idempotencyKey, ifMatch) },
  );
}

export function listRequestEvents(
  requestId: string,
  params?: RequestEventsParams,
): Promise<PaginatedResponse<StatusEvent>> {
  return apiClient.get<PaginatedResponse<StatusEvent>>(
    `/rescue-requests/${requestId}/events`,
    { params: params as Record<string, string | number | boolean | undefined> },
  );
}

export function appendStatusEvent(
  requestId: string,
  input: AppendEventInput,
  idempotencyKey?: string,
  ifMatch?: string,
): Promise<StatusEvent> {
  return apiClient.post<StatusEvent>(
    `/rescue-requests/${requestId}/events`,
    input,
    { headers: buildMutationHeaders(idempotencyKey, ifMatch) },
  );
}

export function getCurrentState(requestId: string): Promise<CurrentStateSnapshot> {
  return apiClient.get<CurrentStateSnapshot>(`/rescue-requests/${requestId}/current`);
}

export function listIncidentRequests(
  incidentId: string,
  params?: IncidentRequestsParams,
): Promise<IncidentRequestsResponse> {
  return apiClient.get<IncidentRequestsResponse>(
    `/incidents/${incidentId}/rescue-requests`,
    { params: params as Record<string, string | number | boolean | undefined> },
  );
}

export function getIdempotencyRecord(
  keyHash: string,
  params?: IdempotencyParams,
): Promise<IdempotencyRecordResponse> {
  return apiClient.get<IdempotencyRecordResponse>(
    `/idempotency-keys/${keyHash}`,
    {
      params: params as Record<string, string | number | boolean | undefined>,
    },
  );
}

export function triageRequest(
  requestId: string,
  input: Omit<AppendEventInput, 'newStatus'>,
  idempotencyKey?: string,
  ifMatch?: string,
): Promise<StatusTransitionResponse> {
  return apiClient.post<StatusTransitionResponse>(
    `/rescue-requests/${requestId}/triage`,
    input,
    { headers: buildMutationHeaders(idempotencyKey, ifMatch) },
  );
}

export function assignRequest(
  requestId: string,
  input: Omit<AppendEventInput, 'newStatus'>,
  idempotencyKey?: string,
  ifMatch?: string,
): Promise<StatusTransitionResponse> {
  return apiClient.post<StatusTransitionResponse>(
    `/rescue-requests/${requestId}/assign`,
    input,
    { headers: buildMutationHeaders(idempotencyKey, ifMatch) },
  );
}

export function startRequest(
  requestId: string,
  input: Omit<AppendEventInput, 'newStatus'>,
  idempotencyKey?: string,
  ifMatch?: string,
): Promise<StatusTransitionResponse> {
  return apiClient.post<StatusTransitionResponse>(
    `/rescue-requests/${requestId}/start`,
    input,
    { headers: buildMutationHeaders(idempotencyKey, ifMatch) },
  );
}

export function resolveRequest(
  requestId: string,
  input: Omit<AppendEventInput, 'newStatus'>,
  idempotencyKey?: string,
  ifMatch?: string,
): Promise<StatusTransitionResponse> {
  return apiClient.post<StatusTransitionResponse>(
    `/rescue-requests/${requestId}/resolve`,
    input,
    { headers: buildMutationHeaders(idempotencyKey, ifMatch) },
  );
}

export function cancelRequest(
  requestId: string,
  input: Omit<AppendEventInput, 'newStatus'>,
  idempotencyKey?: string,
  ifMatch?: string,
): Promise<StatusTransitionResponse> {
  return apiClient.post<StatusTransitionResponse>(
    `/rescue-requests/${requestId}/cancel`,
    input,
    { headers: buildMutationHeaders(idempotencyKey, ifMatch) },
  );
}
