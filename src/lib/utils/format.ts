import {
  RequestStatus,
  RequestType,
  SourceChannel,
  UpdateType,
  PriorityLevel,
} from '@/types/rescue';

const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: 'ยื่นคำขอแล้ว',
  TRIAGED: 'คัดกรองแล้ว',
  ASSIGNED: 'มอบหมายแล้ว',
  IN_PROGRESS: 'กำลังดำเนินการ',
  RESOLVED: 'เสร็จสิ้น',
  CANCELLED: 'ยกเลิกแล้ว',
};

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  MEDICAL: 'ฉุกเฉินทางการแพทย์',
  RESCUE: 'กู้ภัย',
  EVACUATION: 'อพยพ',
  SUPPLY: 'ขอความช่วยเหลือสิ่งของ',
  OTHER: 'อื่น ๆ',
};

const SOURCE_CHANNEL_LABELS: Record<SourceChannel, string> = {
  WEB: 'เว็บไซต์',
  MOBILE: 'แอปพลิเคชัน',
  CALL_CENTER: 'ศูนย์รับสาย',
  LINE: 'LINE',
  OTHER: 'อื่น ๆ',
};

const UPDATE_TYPE_LABELS: Record<UpdateType, string> = {
  NOTE: 'บันทึกเพิ่มเติม',
  LOCATION_DETAILS: 'รายละเอียดสถานที่',
  PEOPLE_COUNT: 'จำนวนผู้ประสบภัย',
  SPECIAL_NEEDS: 'ความต้องการพิเศษ',
  CONTACT_INFO: 'ข้อมูลติดต่อ',
};

const PRIORITY_LEVEL_LABELS: Record<PriorityLevel, string> = {
  LOW: 'ต่ำ',
  MEDIUM: 'ปานกลาง',
  HIGH: 'สูง',
  CRITICAL: 'วิกฤต',
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
