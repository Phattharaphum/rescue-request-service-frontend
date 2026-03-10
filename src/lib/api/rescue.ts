import { apiClient } from '@/lib/api/client';
import {
  RescueRequestCreateInput,
  RescueRequestCreateResponse,
  CitizenTrackingLookupInput,
  CitizenTrackingLookupResponse,
  CitizenStatusResponse,
  CitizenUpdateCreateInput,
  CitizenUpdateItem,
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

// ─── Shared param types ───────────────────────────────────────────────────────

interface CursorParams {
  cursor?: string;
  limit?: number;
}

interface RequestDetailParams extends CursorParams {
  includeUpdates?: boolean;
  includeEvents?: boolean;
}

interface IncidentRequestsParams extends CursorParams {
  status?: string;
  requestType?: string;
  priorityLevel?: string;
  assignedUnitId?: string;
  order?: 'ASC' | 'DESC';
}

interface IdempotencyParams {
  incidentId?: string;
}

// ─── Citizen endpoints ────────────────────────────────────────────────────────

export function createRescueRequest(
  input: RescueRequestCreateInput,
  idempotencyKey: string,
): Promise<RescueRequestCreateResponse> {
  return apiClient.post<RescueRequestCreateResponse>('/requests', input, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
}

export function lookupTracking(
  input: CitizenTrackingLookupInput,
): Promise<CitizenTrackingLookupResponse> {
  return apiClient.post<CitizenTrackingLookupResponse>('/requests/lookup', input);
}

export function getCitizenStatus(requestId: string): Promise<CitizenStatusResponse> {
  return apiClient.get<CitizenStatusResponse>(`/requests/${requestId}/citizen-status`);
}

export function createCitizenUpdate(
  requestId: string,
  input: CitizenUpdateCreateInput,
  idempotencyKey: string,
): Promise<CitizenUpdateItem> {
  return apiClient.post<CitizenUpdateItem>(
    `/requests/${requestId}/citizen-updates`,
    input,
    { headers: { 'Idempotency-Key': idempotencyKey } },
  );
}

export function listCitizenUpdates(
  requestId: string,
  params?: CursorParams,
): Promise<CitizenUpdateListResponse> {
  return apiClient.get<CitizenUpdateListResponse>(
    `/requests/${requestId}/citizen-updates`,
    { params: params as Record<string, string | number | boolean | undefined> },
  );
}

// ─── Staff / detail endpoints ─────────────────────────────────────────────────

export function getRequestDetail(
  requestId: string,
  params?: RequestDetailParams,
): Promise<RequestDetailResponse> {
  return apiClient.get<RequestDetailResponse>(`/requests/${requestId}`, {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

export function patchRequest(
  requestId: string,
  input: PatchRequestInput,
  idempotencyKey: string,
  ifMatch?: string,
): Promise<PatchRequestResponse> {
  const headers: Record<string, string> = {
    'Idempotency-Key': idempotencyKey,
  };
  if (ifMatch) headers['If-Match'] = ifMatch;

  return apiClient.patch<PatchRequestResponse>(`/requests/${requestId}`, input, {
    headers,
  });
}

export function listRequestEvents(
  requestId: string,
  params?: CursorParams,
): Promise<PaginatedResponse<StatusEvent>> {
  return apiClient.get<PaginatedResponse<StatusEvent>>(
    `/requests/${requestId}/events`,
    { params: params as Record<string, string | number | boolean | undefined> },
  );
}

export function appendStatusEvent(
  requestId: string,
  input: AppendEventInput,
  idempotencyKey: string,
  ifMatch?: string,
): Promise<StatusEvent> {
  const headers: Record<string, string> = {
    'Idempotency-Key': idempotencyKey,
  };
  if (ifMatch) headers['If-Match'] = ifMatch;

  return apiClient.post<StatusEvent>(`/requests/${requestId}/events`, input, {
    headers,
  });
}

export function getCurrentState(requestId: string): Promise<CurrentStateSnapshot> {
  return apiClient.get<CurrentStateSnapshot>(`/requests/${requestId}/state`);
}

export function listIncidentRequests(
  incidentId: string,
  params?: IncidentRequestsParams,
): Promise<IncidentRequestsResponse> {
  return apiClient.get<IncidentRequestsResponse>(
    `/incidents/${incidentId}/requests`,
    { params: params as Record<string, string | number | boolean | undefined> },
  );
}

export function getIdempotencyRecord(
  keyHash: string,
  params?: IdempotencyParams,
): Promise<IdempotencyRecordResponse> {
  return apiClient.get<IdempotencyRecordResponse>(`/idempotency/${keyHash}`, {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

// ─── Transition shortcuts ─────────────────────────────────────────────────────

export function triageRequest(
  requestId: string,
  input: Omit<AppendEventInput, 'newStatus'>,
  idempotencyKey: string,
  ifMatch?: string,
): Promise<StatusTransitionResponse> {
  const headers: Record<string, string> = {
    'Idempotency-Key': idempotencyKey,
  };
  if (ifMatch) headers['If-Match'] = ifMatch;

  return apiClient.post<StatusTransitionResponse>(
    `/requests/${requestId}/triage`,
    input,
    { headers },
  );
}

export function assignRequest(
  requestId: string,
  input: Omit<AppendEventInput, 'newStatus'>,
  idempotencyKey: string,
  ifMatch?: string,
): Promise<StatusTransitionResponse> {
  const headers: Record<string, string> = {
    'Idempotency-Key': idempotencyKey,
  };
  if (ifMatch) headers['If-Match'] = ifMatch;

  return apiClient.post<StatusTransitionResponse>(
    `/requests/${requestId}/assign`,
    input,
    { headers },
  );
}

export function startRequest(
  requestId: string,
  input: Omit<AppendEventInput, 'newStatus'>,
  idempotencyKey: string,
  ifMatch?: string,
): Promise<StatusTransitionResponse> {
  const headers: Record<string, string> = {
    'Idempotency-Key': idempotencyKey,
  };
  if (ifMatch) headers['If-Match'] = ifMatch;

  return apiClient.post<StatusTransitionResponse>(
    `/requests/${requestId}/start`,
    input,
    { headers },
  );
}

export function resolveRequest(
  requestId: string,
  input: Omit<AppendEventInput, 'newStatus'>,
  idempotencyKey: string,
  ifMatch?: string,
): Promise<StatusTransitionResponse> {
  const headers: Record<string, string> = {
    'Idempotency-Key': idempotencyKey,
  };
  if (ifMatch) headers['If-Match'] = ifMatch;

  return apiClient.post<StatusTransitionResponse>(
    `/requests/${requestId}/resolve`,
    input,
    { headers },
  );
}

export function cancelRequest(
  requestId: string,
  input: Omit<AppendEventInput, 'newStatus'>,
  idempotencyKey: string,
  ifMatch?: string,
): Promise<StatusTransitionResponse> {
  const headers: Record<string, string> = {
    'Idempotency-Key': idempotencyKey,
  };
  if (ifMatch) headers['If-Match'] = ifMatch;

  return apiClient.post<StatusTransitionResponse>(
    `/requests/${requestId}/cancel`,
    input,
    { headers },
  );
}
