import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(10, 'หมายเลขโทรศัพท์ต้องมีอย่างน้อย 10 หลัก')
  .max(15, 'หมายเลขโทรศัพท์ต้องไม่เกิน 15 หลัก')
  .regex(/^\d{10,15}$/, 'หมายเลขโทรศัพท์ต้องเป็นตัวเลขเท่านั้น');

export const limitSchema = z.coerce
  .number()
  .int('ต้องเป็นจำนวนเต็ม')
  .min(1, 'ต้องมากกว่า 0')
  .max(100, 'ต้องไม่เกิน 100')
  .optional();

export const cursorSchema = z.string().optional();

export const orderSchema = z.enum(['ASC', 'DESC']).optional();
