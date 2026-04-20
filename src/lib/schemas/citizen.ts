// src\lib\schemas\citizen.ts
import { z } from 'zod';
import { phoneSchema } from '@/lib/schemas/common';

const REQUEST_TYPES = [
  'EVACUATION',
  'SUPPLY',
  'MEDICAL',
  'OTHER',
] as const;
const SOURCE_CHANNELS = ['WEB'] as const;
const UPDATE_TYPES = [
  'NOTE',
  'LOCATION_DETAILS',
  'PEOPLE_COUNT',
  'SPECIAL_NEEDS',
  'CONTACT_INFO',
] as const;

export const rescueRequestSchema = z.object({
  incidentId: z.string().min(1, 'กรุณาเลือกเหตุการณ์'),
  requestType: z.enum(REQUEST_TYPES, { error: 'กรุณาเลือกประเภทคำขอ' }),
  description: z.string().min(1, 'กรุณาอธิบายสถานการณ์').max(1000, 'ไม่เกิน 1,000 ตัวอักษร'),
  peopleCount: z.coerce
    .number()
    .int('ต้องเป็นจำนวนเต็ม')
    .min(1, 'ต้องมีผู้ประสบภัยอย่างน้อย 1 คน')
    .max(10000, 'ไม่เกิน 10,000 คน'),
  latitude: z.coerce
    .number()
    .min(-90, 'ละติจูดไม่ถูกต้อง')
    .max(90, 'ละติจูดไม่ถูกต้อง'),
  longitude: z.coerce
    .number()
    .min(-180, 'ลองจิจูดไม่ถูกต้อง')
    .max(180, 'ลองจิจูดไม่ถูกต้อง'),
  contactName: z
    .string()
    .min(2, 'ชื่อผู้ติดต่ออย่างน้อย 2 ตัวอักษร')
    .max(100, 'ไม่เกิน 100 ตัวอักษร'),
  contactPhone: phoneSchema,
  sourceChannel: z.enum(SOURCE_CHANNELS, { error: 'กรุณาเลือกช่องทางการแจ้ง' }),
  specialNeeds: z.string().max(500, 'ไม่เกิน 500 ตัวอักษร').optional(),
  locationDetails: z.string().max(500, 'ไม่เกิน 500 ตัวอักษร').optional(),
  province: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  subdistrict: z.string().max(100).optional(),
  addressLine: z.string().max(300, 'ไม่เกิน 300 ตัวอักษร').optional(),
});

export type RescueRequestFormValues = z.infer<typeof rescueRequestSchema>;

export const trackingLookupSchema = z.object({
  contactPhone: phoneSchema,
  trackingCode: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกรหัสติดตาม')
    .regex(/^\d{6}$/, 'กรุณากรอกรหัสติดตามเป็นตัวเลข 6 หลัก'),
});

export type TrackingLookupFormValues = z.infer<typeof trackingLookupSchema>;

// Dynamic payload schemas per updateType
const notePayloadSchema = z.object({
  note: z.string().trim().min(1, 'กรุณากรอกข้อความ').max(1000, 'ไม่เกิน 1,000 ตัวอักษร'),
});

const locationDetailsPayloadSchema = z.object({
  locationDetails: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกรายละเอียดสถานที่')
    .max(500, 'ไม่เกิน 500 ตัวอักษร'),
});

const peopleCountPayloadSchema = z.object({
  peopleCount: z.coerce
    .number()
    .int('ต้องเป็นจำนวนเต็ม')
    .min(1, 'ต้องมีอย่างน้อย 1 คน')
    .max(10000, 'ไม่เกิน 10,000 คน'),
});

const specialNeedsPayloadSchema = z.object({
  specialNeeds: z.string().trim().min(1, 'กรุณาระบุความต้องการพิเศษ').max(500),
});

const contactInfoPayloadSchema = z
  .object({
    contactName: z.string().trim().min(2, 'ชื่อผู้ติดต่ออย่างน้อย 2 ตัวอักษร').max(100).optional(),
    contactPhone: phoneSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const hasName = !!data.contactName?.trim();
    const hasPhone = !!data.contactPhone?.trim();

    if (!hasName && !hasPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contactName'],
        message: 'กรุณากรอกอย่างน้อยชื่อผู้ติดต่อหรือเบอร์โทรศัพท์',
      });
    }
  });

export const citizenUpdateSchema = z
  .object({
    trackingCode: z.string().trim().min(1, 'กรุณากรอกรหัสติดตาม'),
    updateType: z.enum(UPDATE_TYPES, { error: 'กรุณาเลือกประเภทการอัปเดต' }),
    updatePayload: z.record(z.string(), z.unknown()),
  })
  .superRefine((data, ctx) => {
    let result;

    switch (data.updateType) {
      case 'NOTE':
        result = notePayloadSchema.safeParse(data.updatePayload);
        break;
      case 'LOCATION_DETAILS':
        result = locationDetailsPayloadSchema.safeParse(data.updatePayload);
        break;
      case 'PEOPLE_COUNT':
        result = peopleCountPayloadSchema.safeParse(data.updatePayload);
        break;
      case 'SPECIAL_NEEDS':
        result = specialNeedsPayloadSchema.safeParse(data.updatePayload);
        break;
      case 'CONTACT_INFO':
        result = contactInfoPayloadSchema.safeParse(data.updatePayload);
        break;
      default:
        return;
    }

    if (result && !result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['updatePayload', ...issue.path],
          message: issue.message,
        });
      });
    }
  });

export type CitizenUpdateFormValues = z.infer<typeof citizenUpdateSchema>;
