import { PaginatedResponse } from '@/types/api';

export type RequestStatus =
  | 'SUBMITTED'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CANCELLED';

export type RequestType = 'MEDICAL' | 'RESCUE' | 'EVACUATION' | 'SUPPLY' | 'OTHER';

export type SourceChannel = 'WEB' | 'MOBILE' | 'CALL_CENTER' | 'LINE' | 'OTHER';

export type UpdateType =
  | 'NOTE'
  | 'LOCATION_DETAILS'
  | 'PEOPLE_COUNT'
  | 'SPECIAL_NEEDS'
  | 'CONTACT_INFO';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ─── Create Request ───────────────────────────────────────────────────────────

export interface RescueRequestCreateInput {
  incidentId: string;
  requestType: RequestType;
  description: string;
  peopleCount: number;
  latitude: number;
  longitude: number;
  contactName: string;
  contactPhone: string;
  sourceChannel: SourceChannel;
  specialNeeds?: string;
  locationDetails?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  addressLine?: string;
}

export interface RescueRequestCreateResponse {
  requestId: string;
  trackingCode: string;
  status: RequestStatus;
  submittedAt: string;
}

// ─── Citizen Tracking ────────────────────────────────────────────────────────

export interface CitizenTrackingLookupInput {
  contactPhone: string;
  trackingCode: string;
}

export interface CitizenTrackingLookupResponse {
  requestId: string;
  incidentId: string;
}

export interface CitizenStatusLocation {
  latitude: number;
  longitude: number;
  locationDetails?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  addressLine?: string;
}

export interface CitizenStatusResponse {
  requestId: string;
  incidentId: string;
  requestType: RequestType;
  status: RequestStatus;
  statusMessage: string;
  nextSuggestedAction: string;
  description: string;
  peopleCount: number;
  specialNeeds?: string;
  submittedAt: string;
  lastCitizenUpdateAt?: string;
  contactName: string;
  contactPhoneMasked: string;
  location: CitizenStatusLocation;
  priorityLevel: PriorityLevel;
  assignedUnitId?: string;
  assignedAt?: string;
  latestNote?: string;
  lastUpdatedAt: string;
  stateVersion: number;
  latestEvent?: StatusEvent;
  recentEvents: StatusEvent[];
}

// ─── Citizen Updates ─────────────────────────────────────────────────────────

export interface CitizenUpdateCreateInput {
  trackingCode: string;
  updateType: UpdateType;
  updatePayload: Record<string, unknown>;
}

export interface CitizenUpdateItem {
  id: string;
  requestId: string;
  updateType: UpdateType;
  updatePayload: Record<string, unknown>;
  createdAt: string;
  createdBy?: string;
}

export type CitizenUpdateListResponse = PaginatedResponse<CitizenUpdateItem>;

// ─── Status Events ───────────────────────────────────────────────────────────

export interface StatusEvent {
  eventId: string;
  requestId: string;
  incidentId: string;
  version: number;
  status: RequestStatus;
  previousStatus?: RequestStatus;
  changedBy: string;
  changedByRole: string;
  changeReason?: string;
  responderUnitId?: string;
  note?: string;
  priorityScore?: number;
  priorityLevel?: PriorityLevel;
  meta?: Record<string, unknown>;
  createdAt: string;
}

// ─── Request Master / Snapshot ───────────────────────────────────────────────

export interface RescueRequestMaster {
  requestId: string;
  incidentId: string;
  requestType: RequestType;
  description: string;
  peopleCount: number;
  specialNeeds?: string;
  latitude: number;
  longitude: number;
  contactName: string;
  contactPhone: string;
  sourceChannel: SourceChannel;
  locationDetails?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  addressLine?: string;
  submittedAt: string;
  lastCitizenUpdateAt?: string;
}

export interface CurrentStateSnapshot {
  requestId: string;
  incidentId: string;
  lastEventId: string;
  stateVersion: number;
  status: RequestStatus;
  priorityScore?: number;
  priorityLevel?: PriorityLevel;
  assignedUnitId?: string;
  assignedAt?: string;
  latestNote?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt: string;
}

export interface RequestDetailResponse {
  master: RescueRequestMaster;
  currentState: CurrentStateSnapshot;
  updateItems?: CitizenUpdateItem[];
  events?: StatusEvent[];
  citizenUpdates?: CitizenUpdateItem[];
}

// ─── Status Transitions ──────────────────────────────────────────────────────

export interface StatusTransitionResponse {
  requestId: string;
  newStatus: RequestStatus;
  stateVersion: number;
  transitionedAt: string;
}

// ─── Patch Request ───────────────────────────────────────────────────────────

export interface PatchRequestInput {
  description?: string;
  peopleCount?: number;
  specialNeeds?: string;
  locationDetails?: string;
  addressLine?: string;
}

export interface PatchRequestResponse {
  requestId: string;
  updated: Partial<RescueRequestMaster>;
}

// ─── Incident Requests ───────────────────────────────────────────────────────

export interface IncidentRequestSummary {
  requestId: string;
  incidentId: string;
  status: RequestStatus;
  requestType: RequestType;
  contactName: string;
  peopleCount: number;
  priorityLevel?: PriorityLevel;
  assignedUnitId?: string;
  submittedAt: string;
  lastUpdatedAt: string;
}

export type IncidentRequestsResponse = PaginatedResponse<IncidentRequestSummary>;

// ─── Idempotency ─────────────────────────────────────────────────────────────

export interface IdempotencyRecordResponse {
  keyHash: string;
  requestId?: string;
  status: string;
  response?: Record<string, unknown>;
  requestFingerprint?: string;
  createdAt: string;
  expiresAt?: string;
}

// ─── Append Event ────────────────────────────────────────────────────────────

export interface AppendEventInput {
  newStatus: RequestStatus;
  changedBy: string;
  changedByRole: string;
  changeReason?: string;
  responderUnitId?: string;
  reason?: string;
  priorityScore?: number;
  priorityLevel?: PriorityLevel;
  note?: string;
  meta?: Record<string, unknown>;
}
