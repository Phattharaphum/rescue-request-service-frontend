import {
  RequestStatus,
  RequestType,
  SourceChannel,
  UpdateType,
  PriorityLevel,
} from '@/types/rescue';

const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: 'Submitted',
  TRIAGED: 'Triaged',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CANCELLED: 'Cancelled',
};

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  FLOOD: 'Flood',
  FIRE: 'Fire',
  EARTHQUAKE: 'Earthquake',
  LANDSLIDE: 'Landslide',
  STORM: 'Storm',
  MEDICAL: 'Medical',
  EVACUATION: 'Evacuation',
  SUPPLY: 'Supply',
  OTHER: 'Other',
};

const SOURCE_CHANNEL_LABELS: Record<SourceChannel, string> = {
  WEB: 'Website',
  MOBILE: 'Mobile App',
  LINE: 'LINE',
  PHONE: 'Phone',
  WALK_IN: 'Walk-in',
  OTHER: 'Other',
};

const UPDATE_TYPE_LABELS: Record<UpdateType, string> = {
  NOTE: 'Note',
  LOCATION_DETAILS: 'Location Details',
  PEOPLE_COUNT: 'People Count',
  SPECIAL_NEEDS: 'Special Needs',
  CONTACT_INFO: 'Contact Info',
};

const PRIORITY_LEVEL_LABELS: Record<PriorityLevel, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export function formatStatus(status: RequestStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatRequestType(type: RequestType): string {
  return REQUEST_TYPE_LABELS[type] ?? type;
}

export function formatSourceChannel(channel: SourceChannel): string {
  return SOURCE_CHANNEL_LABELS[channel] ?? channel;
}

export function formatUpdateType(type: UpdateType): string {
  return UPDATE_TYPE_LABELS[type] ?? type;
}

export function formatPriorityLevel(level: PriorityLevel): string {
  return PRIORITY_LEVEL_LABELS[level] ?? level;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('th-TH');
}
