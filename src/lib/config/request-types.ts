import type { RequestType } from '@/types/rescue';

export const REQUEST_TYPE_VALUES = ['MEDICAL', 'EVACUATION', 'SUPPLY'] as const;

export type SupportedRequestType = (typeof REQUEST_TYPE_VALUES)[number];

export const REQUEST_TYPE_OPTIONS: Array<{
  value: SupportedRequestType;
  label: string;
  shortLabel: string;
}> = [
  {
    value: 'MEDICAL',
    label: 'การแพทย์ / ยา / ผู้ป่วยฉุกเฉิน',
    shortLabel: 'การแพทย์',
  },
  {
    value: 'EVACUATION',
    label: 'อพยพออกจากพื้นที่ / ช่วยเหลือฉุกเฉิน / ติดค้าง',
    shortLabel: 'อพยพ',
  },
  {
    value: 'SUPPLY',
    label: 'อาหาร / น้ำดื่ม / เสบียง',
    shortLabel: 'เสบียง',
  },
];

export const REQUEST_TYPE_LABELS: Record<SupportedRequestType, string> =
  REQUEST_TYPE_OPTIONS.reduce(
    (acc, option) => {
      acc[option.value] = option.label;
      return acc;
    },
    {} as Record<SupportedRequestType, string>,
  );

export function isSupportedRequestType(value: string | null | undefined): value is SupportedRequestType {
  return REQUEST_TYPE_VALUES.includes(value as SupportedRequestType);
}

export function getRequestTypeLabel(type: RequestType): string {
  return isSupportedRequestType(type) ? REQUEST_TYPE_LABELS[type] : type;
}
