'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert } from '@/components/shared/error-alert';
import { trackingLookupSchema, TrackingLookupFormValues } from '@/lib/schemas/citizen';
import { lookupTracking } from '@/lib/api/rescue';

interface TrackingLookupFormProps {
  onSuccess: (requestId: string, incidentId: string, trackingCode: string) => void;
}

function sanitizeTrackingCode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

export function TrackingLookupForm({ onSuccess }: TrackingLookupFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TrackingLookupFormValues>({
    resolver: zodResolver(trackingLookupSchema),
    defaultValues: {
      contactPhone: '',
      trackingCode: '',
    },
  });

  const trackingCodeField = register('trackingCode', {
    onChange: (event) => {
      const digits = sanitizeTrackingCode(String(event.target.value ?? ''));
      event.target.value = digits;
    },
  });

  const contactPhoneField = register('contactPhone', {
    onChange: (event) => {
      const digits = String(event.target.value ?? '')
        .replace(/\D/g, '')
        .slice(0, 10);
      event.target.value = digits;
    },
  });

  const onSubmit = async (data: TrackingLookupFormValues) => {
    setApiError(null);
    const normalizedTrackingCode = sanitizeTrackingCode(data.trackingCode);

    try {
      const result = await lookupTracking({
        ...data,
        trackingCode: normalizedTrackingCode,
      });
      onSuccess(result.requestId, result.incidentId, normalizedTrackingCode);
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e?.status === 403 || e?.status === 404) {
        setApiError('ไม่พบข้อมูลคำขอ กรุณาตรวจสอบรหัสติดตามและเบอร์โทรศัพท์อีกครั้ง');
      } else {
        setApiError(e?.message ?? 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white">
      <div className="grid h-3 grid-cols-4">
        <span className="bg-cyan-300" />
        <span className="bg-blue-500" />
        <span className="bg-amber-300" />
        <span className="bg-emerald-400" />
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-cyan-700">Lookup</p>
            <h2 className="mt-1 text-2xl font-black tracking-normal text-slate-950">
              ค้นหาคำขอของคุณ
            </h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Search size={24} />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {apiError && <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />}

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-700">
                <Phone size={18} className="text-cyan-700" />
                เบอร์โทรศัพท์ที่ใช้แจ้งคำขอ
              </div>
              <Input
                required
                type="tel"
                placeholder="0812345678"
                className="h-16 rounded-2xl border-slate-200 bg-white text-center font-mono text-3xl font-black tracking-[0.14em] text-slate-950 placeholder:text-lg placeholder:font-semibold placeholder:tracking-normal sm:h-20 sm:text-4xl"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                helperText="กรอกตัวเลข 10 หลัก"
                {...contactPhoneField}
                onPaste={(event) => {
                  event.preventDefault();
                  const pasted = event.clipboardData.getData('text');
                  const digits = pasted.replace(/\D/g, '').slice(0, 10);
                  setValue('contactPhone', digits, {
                    shouldDirty: true,
                    shouldValidate: true,
                    shouldTouch: true,
                  });
                }}
                error={errors.contactPhone?.message}
              />
            </div>

            <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-blue-800">
                <KeyRound size={18} />
                รหัสติดตาม
              </div>
              <Input
                required
                placeholder="123456"
                className="h-16 rounded-2xl border-blue-200 bg-white text-center font-mono text-4xl font-black tracking-[0.28em] text-blue-950 placeholder:text-xl placeholder:font-semibold placeholder:tracking-normal sm:h-20 sm:text-5xl"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                helperText="รหัสตัวเลข 6 หลักที่ได้รับหลังส่งคำขอสำเร็จ"
                {...trackingCodeField}
                onPaste={(event) => {
                  event.preventDefault();
                  const pasted = event.clipboardData.getData('text');
                  const digits = sanitizeTrackingCode(pasted);
                  setValue('trackingCode', digits, {
                    shouldDirty: true,
                    shouldValidate: true,
                    shouldTouch: true,
                  });
                }}
                error={errors.trackingCode?.message}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="h-12 w-full rounded-2xl bg-slate-950 text-base font-black hover:bg-slate-800"
            loading={isSubmitting}
            disabled={isSubmitting}
            leftIcon={!isSubmitting ? <Search size={18} /> : undefined}
          >
            {isSubmitting ? 'กำลังค้นหา...' : 'ค้นหาสถานะ'}
          </Button>
        </form>
      </div>
    </section>
  );
}
