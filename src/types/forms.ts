import {
  RequestStatus,
  RequestType,
  SourceChannel,
  UpdateType,
  PriorityLevel,
} from '@/types/rescue';

// ─── Citizen Forms ────────────────────────────────────────────────────────────

export interface CitizenRequestFormData {
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

export interface TrackingLookupFormData {
  contactPhone: string;
  trackingCode: string;
}

export interface CitizenUpdateFormData {
  trackingCode: string;
  updateType: UpdateType;
  updatePayload: Record<string, unknown>;
}

// ─── Staff Forms ──────────────────────────────────────────────────────────────

export interface PatchRequestFormData {
  description?: string;
  peopleCount?: number;
  specialNeeds?: string;
  locationDetails?: string;
  addressLine?: string;
}

export interface AppendEventFormData {
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

export interface TriageCommandFormData {
  changedBy: string;
  changedByRole: string;
  priorityScore?: number;
  priorityLevel?: PriorityLevel;
  note?: string;
  changeReason?: string;
}

export interface AssignCommandFormData {
  changedBy: string;
  changedByRole: string;
  responderUnitId: string;
  note?: string;
  changeReason?: string;
}

export interface StartCommandFormData {
  changedBy: string;
  changedByRole: string;
  note?: string;
  changeReason?: string;
}

export interface ResolveCommandFormData {
  changedBy: string;
  changedByRole: string;
  note?: string;
  changeReason?: string;
}

export interface CancelCommandFormData {
  changedBy: string;
  changedByRole: string;
  reason: string;
  note?: string;
}
