// src\lib\schemas\common.ts
import { z } from 'zod';

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก');

export const limitSchema = z.coerce
  .number()
  .int('ต้องเป็นจำนวนเต็ม')
  .min(1, 'ต้องมากกว่า 0')
  .max(100, 'ต้องไม่เกิน 100')
  .optional();

export const cursorSchema = z.string().optional();

export const orderSchema = z.enum(['ASC', 'DESC']).optional();
