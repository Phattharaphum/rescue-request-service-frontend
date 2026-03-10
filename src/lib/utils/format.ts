import {
  RequestStatus,
  RequestType,
  SourceChannel,
  UpdateType,
  PriorityLevel,
} from '@/types/rescue';

const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: 'รับคำขอแล้ว',
  TRIAGED: 'คัดกรองแล้ว',
  ASSIGNED: 'มอบหมายแล้ว',
  IN_PROGRESS: 'กำลังช่วยเหลือ',
  RESOLVED: 'เสร็จสิ้น',
  CANCELLED: 'ยกเลิก',
};

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  FLOOD: 'น้ำท่วม',
  FIRE: 'ไฟไหม้',
  EARTHQUAKE: 'แผ่นดินไหว',
  LANDSLIDE: 'ดินถล่ม',
  STORM: 'พายุ',
  MEDICAL: 'การแพทย์ / ยา / ผู้ป่วยฉุกเฉิน',
  EVACUATION: 'อพยพออกจากพื้นที่',
  SUPPLY: 'อาหาร / น้ำดื่ม / เสบียง',
  OTHER: 'เครื่องใช้จำเป็น',
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
  NOTE: 'หมายเหตุ',
  LOCATION_DETAILS: 'รายละเอียดตำแหน่ง',
  PEOPLE_COUNT: 'จำนวนผู้ประสบภัย',
  SPECIAL_NEEDS: 'ความต้องการพิเศษ',
  CONTACT_INFO: 'ข้อมูลติดต่อ',
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
