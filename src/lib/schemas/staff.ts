import { z } from 'zod';

const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const ROLES = ['STAFF', 'SUPERVISOR', 'ADMIN', 'SYSTEM'] as const;

export const patchRequestSchema = z
  .object({
    description: z.string().min(10, 'อย่างน้อย 10 ตัวอักษร').max(1000).optional(),
    peopleCount: z.coerce.number().int().min(1).max(10000).optional(),
    specialNeeds: z.string().max(500).optional(),
    locationDetails: z.string().max(500).optional(),
    addressLine: z.string().max(300).optional(),
  })
  .refine(
    (data) =>
      Object.values(data).some((v) => v !== undefined && v !== ''),
    { message: 'กรุณาระบุข้อมูลที่ต้องการแก้ไขอย่างน้อยหนึ่งรายการ' },
  );

export type PatchRequestFormValues = z.infer<typeof patchRequestSchema>;

const baseEventSchema = z.object({
  changedBy: z.string().min(1, 'กรุณาระบุผู้ดำเนินการ'),
  changedByRole: z.enum(ROLES, { error: 'กรุณาเลือกบทบาท' }),
  changeReason: z.string().max(500).optional(),
  note: z.string().max(1000).optional(),
});

export const triageSchema = baseEventSchema.extend({
  priorityScore: z.coerce.number().int().min(0).max(100).optional(),
  priorityLevel: z.enum(PRIORITY_LEVELS).optional(),
});

export type TriageFormValues = z.infer<typeof triageSchema>;

export const assignSchema = baseEventSchema.extend({
  responderUnitId: z.string().min(1, 'กรุณาระบุหน่วยงานที่รับผิดชอบ').max(100),
});

export type AssignFormValues = z.infer<typeof assignSchema>;

export const startSchema = baseEventSchema;

export type StartFormValues = z.infer<typeof startSchema>;

export const resolveSchema = baseEventSchema;

export type ResolveFormValues = z.infer<typeof resolveSchema>;

export const cancelSchema = baseEventSchema.extend({
  reason: z.string().min(5, 'กรุณาระบุเหตุผลการยกเลิกอย่างน้อย 5 ตัวอักษร').max(500),
});

export type CancelFormValues = z.infer<typeof cancelSchema>;

export const appendEventSchema = z
  .object({
    newStatus: z.enum(
      ['SUBMITTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
      { error: 'กรุณาเลือกสถานะ' },
    ),
    changedBy: z.string().min(1, 'กรุณาระบุผู้ดำเนินการ'),
    changedByRole: z.enum(ROLES, { error: 'กรุณาเลือกบทบาท' }),
    changeReason: z.string().max(500).optional(),
    responderUnitId: z.string().max(100).optional(),
    reason: z.string().max(500).optional(),
    priorityScore: z.coerce.number().int().min(0).max(100).optional(),
    priorityLevel: z.enum(PRIORITY_LEVELS).optional(),
    note: z.string().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.newStatus === 'ASSIGNED' && !data.responderUnitId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['responderUnitId'],
        message: 'กรุณาระบุหน่วยงานที่รับผิดชอบเมื่อสถานะเป็น "มอบหมายแล้ว"',
      });
    }
    if (data.newStatus === 'CANCELLED' && !data.reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reason'],
        message: 'กรุณาระบุเหตุผลการยกเลิก',
      });
    }
  });

export type AppendEventFormValues = z.infer<typeof appendEventSchema>;
