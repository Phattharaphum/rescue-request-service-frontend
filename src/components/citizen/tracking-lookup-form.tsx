'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TrackingLookupFormValues>({
    resolver: zodResolver(trackingLookupSchema),
    defaultValues: {
      contactPhone: '',
      trackingCode: '',
    },
  });

  const trackingCodeValue = watch('trackingCode') ?? '';
  const trackingCodeDigits = sanitizeTrackingCode(trackingCodeValue);
  const trackingProgress = useMemo(
    () => Math.min((trackingCodeDigits.length / 6) * 100, 100),
    [trackingCodeDigits.length],
  );

  const trackingCodeField = register('trackingCode', {
    onChange: (event) => {
      const digits = sanitizeTrackingCode(String(event.target.value ?? ''));
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
    <Card className="border-gray-200">
      <CardHeader title="ค้นหาข้อมูลของคุณ" className="bg-white pb-2" />
      <CardContent className="pt-2">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {apiError && <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />}

          <Input
            label="เบอร์โทรศัพท์ที่ใช้แจ้งคำขอ"
            required
            type="tel"
            placeholder="เช่น 0812345678"
            inputMode="numeric"
            maxLength={10}
            {...register('contactPhone', {
              onChange: (event) => {
                const digits = String(event.target.value ?? '')
                  .replace(/\D/g, '')
                  .slice(0, 10);
                event.target.value = digits;
              },
            })}
            error={errors.contactPhone?.message}
          />

          <div className="space-y-2">
            <Input
              label="รหัสติดตาม (Tracking Code)"
              required
              placeholder="เช่น 123456"
              className="font-mono text-center text-xl tracking-[0.35em] placeholder:tracking-normal"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
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

            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-blue-700">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck size={14} />
                  รองรับเฉพาะตัวเลข 6 หลัก
                </span>
                <span>{trackingCodeDigits.length}/6</span>
              </div>
              <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${trackingProgress}%` }}
                />
              </div>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-blue-200 bg-white py-2 text-center font-mono text-sm font-bold text-blue-900"
                  >
                    {trackingCodeDigits[index] ?? '-'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full rounded-xl text-base shadow-sm"
              loading={isSubmitting}
              disabled={isSubmitting}
              leftIcon={<Search size={18} />}
            >
              {isSubmitting ? 'กำลังค้นหา...' : 'ค้นหาสถานะ'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
