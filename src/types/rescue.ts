import { PaginatedResponse } from '@/types/api';

export type RequestStatus =
  | 'SUBMITTED'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CANCELLED';

export type RequestType =
  | 'FLOOD'
  | 'FIRE'
  | 'EARTHQUAKE'
  | 'LANDSLIDE'
  | 'STORM'
  | 'MEDICAL'
  | 'EVACUATION'
  | 'SUPPLY'
  | 'OTHER';

export type SourceChannel =
  | 'WEB'
  | 'MOBILE'
  | 'LINE'
  | 'PHONE'
  | 'WALK_IN'
  | 'OTHER';

export type UpdateType =
  | 'NOTE'
  | 'LOCATION_DETAILS'
  | 'PEOPLE_COUNT'
  | 'SPECIAL_NEEDS'
  | 'CONTACT_INFO';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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
  specialNeeds?: string | null;
  locationDetails?: string | null;
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  addressLine?: string | null;
}

export interface RescueRequestCreateResponse {
  requestId: string;
  trackingCode: string;
  status: RequestStatus;
  submittedAt: string;
}

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
  locationDetails?: string | null;
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  addressLine?: string | null;
}

export interface StatusEvent {
  eventId: string;
  requestId: string;
  previousStatus?: RequestStatus | null;
  newStatus: RequestStatus;
  changedBy?: string | null;
  changedByRole?: string | null;
  changeReason?: string | null;
  meta?: Record<string, unknown> | null;
  priorityScore?: number | null;
  priorityLevel?: PriorityLevel | null;
  responderUnitId?: string | null;
  note?: string | null;
  version: number;
  occurredAt: string;
}

export interface CitizenStatusResponse {
  requestId: string;
  incidentId: string;
  requestType: RequestType;
  status: RequestStatus;
  statusMessage?: string | null;
  nextSuggestedAction?: string | null;
  description?: string | null;
  peopleCount?: number | null;
  specialNeeds?: string | null;
  submittedAt?: string | null;
  lastCitizenUpdateAt?: string | null;
  contactName?: string | null;
  contactPhoneMasked?: string | null;
  location: CitizenStatusLocation;
  priorityLevel?: PriorityLevel | null;
  assignedUnitId?: string | null;
  assignedAt?: string | null;
  latestNote?: string | null;
  lastUpdatedAt?: string | null;
  stateVersion: number;
  latestEvent?: StatusEvent | null;
  recentEvents: StatusEvent[];
}

export interface CitizenUpdateCreateInput {
  trackingCode: string;
  updateType: UpdateType;
  updatePayload: Record<string, unknown>;
}

export interface CitizenUpdateCreateResponse {
  updateId: string;
  requestId: string;
  updateType: UpdateType;
  createdAt: string;
}

export interface CitizenUpdateItem {
  updateId: string;
  requestId: string;
  updateType: UpdateType;
  updatePayload: Record<string, unknown>;
  citizenAuthMethod?: string;
  createdAt: string;
}

export type CitizenUpdateListResponse = PaginatedResponse<CitizenUpdateItem>;

export interface RescueRequestMaster {
  requestId: string;
  incidentId: string;
  requestType: RequestType;
  description: string;
  peopleCount: number;
  specialNeeds?: string | null;
  latitude: number;
  longitude: number;
  contactName: string;
  contactPhone: string;
  sourceChannel: SourceChannel;
  locationDetails?: string | null;
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  addressLine?: string | null;
  submittedAt: string;
  lastCitizenUpdateAt?: string | null;
}

export interface CurrentStateSnapshot {
  requestId: string;
  incidentId: string;
  lastEventId: string;
  stateVersion: number;
  status: RequestStatus;
  priorityScore?: number | null;
  priorityLevel?: PriorityLevel | null;
  assignedUnitId?: string | null;
  assignedAt?: string | null;
  latestNote?: string | null;
  lastUpdatedBy?: string | null;
  lastUpdatedAt: string;
}

export interface RequestDetailResponse {
  master: RescueRequestMaster;
  currentState: CurrentStateSnapshot;
  updateItems?: CitizenUpdateItem[];
  events?: StatusEvent[];
  citizenUpdates?: CitizenUpdateItem[];
}

export interface StatusTransitionResponse {
  eventId: string;
  requestId: string;
  previousStatus: RequestStatus;
  newStatus: RequestStatus;
  version: number;
  occurredAt: string;
}

export interface PatchRequestInput {
  description?: string;
  peopleCount?: number;
  specialNeeds?: string;
  locationDetails?: string;
  addressLine?: string;
}

export interface PatchRequestResponse {
  requestId: string;
  updated: string[];
}

export interface IncidentRequestSummary {
  requestId: string;
  incidentId: string;
  status: RequestStatus;
  requestType: RequestType;
  contactName: string;
  peopleCount?: number;
  priorityLevel?: PriorityLevel | null;
  assignedUnitId?: string | null;
  submittedAt: string;
  lastUpdatedAt?: string;
}

export type IncidentRequestsResponse = PaginatedResponse<IncidentRequestSummary>;

export interface IdempotencyRecordResponse {
  idempotencyKeyHash: string;
  operationName: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  resultResourceId?: string | null;
  responseStatusCode?: number;
  responseBody?: Record<string, unknown>;
  requestFingerprint?: string;
}

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
