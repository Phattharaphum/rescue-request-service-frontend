// src\lib\config\incidents.ts
export interface Incident {
  label: string;
  value: string;
}

export const INCIDENTS: Incident[] = [
  { label: 'อุทกภัยกรุงเทพ 2569', value: 'INC-2026-001' },
  { label: 'พายุภาคใต้ 2569', value: 'INC-2026-002' },
];

export const DEFAULT_INCIDENT_ID = INCIDENTS[0].value;
