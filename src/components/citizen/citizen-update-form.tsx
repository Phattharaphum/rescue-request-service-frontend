// src/components/citizen/citizen-update-form.tsx
'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ErrorAlert } from '@/components/shared/error-alert';
import { SpecialNeedsInput } from '@/components/citizen/special-needs-input';
import { citizenUpdateSchema, CitizenUpdateFormValues } from '@/lib/schemas/citizen';
import { createCitizenUpdate } from '@/lib/api/rescue';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';

const UPDATE_TYPE_OPTIONS = [
  { value: 'NOTE', label: 'หมายเหตุ' },
  { value: 'LOCATION_DETAILS', label: 'รายละเอียดตำแหน่ง' },
  { value: 'PEOPLE_COUNT', label: 'จำนวนผู้ประสบภัย' },
  { value: 'SPECIAL_NEEDS', label: 'ความต้องการพิเศษ' },
  { value: 'CONTACT_INFO', label: 'ข้อมูลติดต่อ' },
];

interface CitizenUpdateFormProps {
  requestId: string;
  trackingCode: string;
  onSuccess?: () => void;
}

function sanitizeUpdatePayload(data: CitizenUpdateFormValues): Record<string, unknown> {
  const payload = data.updatePayload as Record<string, unknown>;

  switch (data.updateType) {
    case 'NOTE':
      return { note: String(payload.note ?? '').trim() };

    case 'LOCATION_DETAILS':
      return { locationDetails: String(payload.locationDetails ?? '').trim() };

    case 'PEOPLE_COUNT': {
      const peopleCount = Number(payload.peopleCount ?? 0);
      return { peopleCount };
    }

    case 'SPECIAL_NEEDS':
      return { specialNeeds: String(payload.specialNeeds ?? '').trim() };

    case 'CONTACT_INFO': {
      const contactName = String(payload.contactName ?? '').trim();
      const contactPhone = String(payload.contactPhone ?? '').trim();
      return {
        ...(contactName ? { contactName } : {}),
        ...(contactPhone ? { contactPhone } : {}),
      };
    }

    default:
      return {};
  }
}

export function CitizenUpdateForm({ requestId, trackingCode, onSuccess }: CitizenUpdateFormProps) {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CitizenUpdateFormValues>({
    resolver: zodResolver(citizenUpdateSchema),
    shouldUnregister: true,
    defaultValues: {
      trackingCode,
      updateType: 'NOTE',
      updatePayload: {},
    },
  });

  const updateType = useWatch({
    control,
    name: 'updateType',
  });

  useEffect(() => {
    setValue('trackingCode', trackingCode.trim(), { shouldValidate: true });
  }, [trackingCode, setValue]);

  const onSubmit = async (data: CitizenUpdateFormValues) => {
    setApiError(null);
    setSuccess(false);

    const input = {
      trackingCode: data.trackingCode.trim(),
      updateType: data.updateType,
      updatePayload: sanitizeUpdatePayload(data),
    };

    try {
      const key = generateIdempotencyKey();
      await createCitizenUpdate(requestId, input, key);

      await queryClient.invalidateQueries({ queryKey: ['citizen-updates', requestId] });

      setSuccess(true);
      reset({ trackingCode, updateType: 'NOTE', updatePayload: {} });
      onSuccess?.();
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e?.status === 403) {
        setApiError('รหัสติดตามไม่ถูกต้อง');
      } else if (e?.status === 409) {
        setApiError('คำขอนี้อยู่ในสถานะสิ้นสุดแล้ว ไม่สามารถอัปเดตเพิ่มเติมได้');
      } else if (e?.status === 422) {
        setApiError('ข้อมูลไม่ผ่านเงื่อนไขการตรวจสอบ กรุณาตรวจสอบประเภทข้อมูลและค่าที่กรอกอีกครั้ง');
      } else {
        setApiError(e?.message ?? 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-cyan-700">Send update</p>
          <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">
            ส่งข้อมูลเพิ่มเติม
          </h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-200 text-slate-950">
          <Send size={22} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <input type="hidden" {...register('trackingCode')} />

        {apiError && <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ส่งข้อมูลเพิ่มเติมสำเร็จแล้ว
          </div>
        )}

        <Controller
          name="updateType"
          control={control}
          render={({ field }) => (
            <Select
              label="ประเภทข้อมูลที่ต้องการอัปเดต"
              required
              options={UPDATE_TYPE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.updateType?.message}
            />
          )}
        />

        {updateType === 'NOTE' && (
          <Controller
            name="updatePayload.note"
            control={control}
            render={({ field }) => (
              <Textarea
                label="หมายเหตุ"
                required
                placeholder="ระบุข้อมูลเพิ่มเติม..."
                value={(field.value as string) ?? ''}
                onChange={field.onChange}
                error={(errors.updatePayload as Record<string, { message?: string }>)?.note?.message}
              />
            )}
          />
        )}

        {updateType === 'LOCATION_DETAILS' && (
          <Controller
            name="updatePayload.locationDetails"
            control={control}
            render={({ field }) => (
              <Textarea
                label="รายละเอียดตำแหน่ง"
                required
                placeholder="ระบุตำแหน่งปัจจุบันให้ละเอียดขึ้น"
                value={(field.value as string) ?? ''}
                onChange={field.onChange}
                error={
                  (errors.updatePayload as Record<string, { message?: string }>)?.locationDetails
                    ?.message
                }
              />
            )}
          />
        )}

        {updateType === 'PEOPLE_COUNT' && (
          <Controller
            name="updatePayload.peopleCount"
            control={control}
            render={({ field }) => (
              <Input
                label="จำนวนผู้ประสบภัย"
                required
                type="number"
                min={1}
                step={1}
                value={(field.value as number | string) ?? ''}
                onChange={field.onChange}
                error={
                  (errors.updatePayload as Record<string, { message?: string }>)?.peopleCount
                    ?.message
                }
              />
            )}
          />
        )}

        {updateType === 'SPECIAL_NEEDS' && (
          <div>
            <label className="mb-1 block text-sm font-bold text-slate-700">
              ความต้องการพิเศษ <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="updatePayload.specialNeeds"
              control={control}
              render={({ field }) => (
                <SpecialNeedsInput value={field.value as string | undefined} onChange={field.onChange} />
              )}
            />
            {(errors.updatePayload as Record<string, { message?: string }>)?.specialNeeds?.message && (
              <p className="mt-1 text-sm font-semibold text-rose-600">
                {(errors.updatePayload as Record<string, { message?: string }>).specialNeeds?.message}
              </p>
            )}
          </div>
        )}

        {updateType === 'CONTACT_INFO' && (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500">
              กรอกอย่างน้อย 1 ช่อง: ชื่อผู้ติดต่อ หรือ เบอร์โทรศัพท์
            </p>
            <Controller
              name="updatePayload.contactName"
              control={control}
              render={({ field }) => (
                <Input
                  label="ชื่อผู้ติดต่อ"
                  placeholder="ชื่อ-นามสกุล"
                  value={(field.value as string) ?? ''}
                  onChange={field.onChange}
                  error={
                    (errors.updatePayload as Record<string, { message?: string }>)?.contactName
                      ?.message
                  }
                />
              )}
            />
            <Controller
              name="updatePayload.contactPhone"
              control={control}
              render={({ field }) => (
                <Input
                  label="เบอร์โทรศัพท์"
                  type="tel"
                  placeholder="0812345678"
                  value={(field.value as string) ?? ''}
                  onChange={field.onChange}
                  error={
                    (errors.updatePayload as Record<string, { message?: string }>)?.contactPhone
                      ?.message
                  }
                />
              )}
            />
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="h-12 w-full rounded-2xl bg-slate-950 font-black hover:bg-slate-800"
          loading={isSubmitting}
          disabled={isSubmitting}
          leftIcon={!isSubmitting ? <Send size={17} /> : undefined}
        >
          {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลเพิ่มเติม'}
        </Button>
      </form>
    </section>
  );
}
