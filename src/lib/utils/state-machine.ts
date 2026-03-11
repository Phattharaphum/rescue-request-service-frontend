import { RequestStatus } from '@/types/rescue';

export interface StateAction {
  action: 'triage' | 'assign' | 'start' | 'resolve' | 'cancel';
  label: string;
  requiresField?: string;
}

export const STATE_TRANSITIONS: Record<RequestStatus, StateAction[]> = {
  SUBMITTED: [
    { action: 'triage', label: 'คัดกรอง' },
    { action: 'cancel', label: 'ยกเลิก', requiresField: 'reason' },
  ],
  TRIAGED: [
    { action: 'assign', label: 'มอบหมาย', requiresField: 'responderUnitId' },
    { action: 'cancel', label: 'ยกเลิก', requiresField: 'reason' },
  ],
  ASSIGNED: [
    { action: 'start', label: 'เริ่มปฏิบัติการ' },
    { action: 'cancel', label: 'ยกเลิก', requiresField: 'reason' },
  ],
  IN_PROGRESS: [
    { action: 'resolve', label: 'เสร็จสิ้น' },
    { action: 'cancel', label: 'ยกเลิก', requiresField: 'reason' },
  ],
  RESOLVED: [],
  CANCELLED: [],
};

export function isTerminalStatus(status: RequestStatus): boolean {
  return status === 'RESOLVED' || status === 'CANCELLED';
}

export function getAvailableActions(status: RequestStatus): StateAction[] {
  return STATE_TRANSITIONS[status] ?? [];
}
