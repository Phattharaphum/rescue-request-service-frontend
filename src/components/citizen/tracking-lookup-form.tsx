'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
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
    <Card className="border-gray-200">
      <CardHeader title="ค้นหาข้อมูลของคุณ" className="bg-white pb-2" />
      <CardContent className="pt-2">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {apiError && <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
            <Input
              label="เบอร์โทรศัพท์ที่ใช้แจ้งคำขอ"
              required
              type="tel"
              placeholder="เช่น 0812345678"
              className="font-mono text-center text-2xl font-semibold tracking-[0.16em] placeholder:tracking-normal"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              helperText="กรอกเบอร์โทรศัพท์ที่ใช้แจ้งคำขอ"
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

          <div className="space-y-3 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/70 to-white p-4">
            <Input
              label="รหัสติดตาม (Tracking Code)"
              required
              placeholder="เช่น 123456"
              className="font-mono text-center text-2xl font-semibold tracking-[0.28em] placeholder:tracking-normal"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              helperText="กรอกหรือวางรหัสติดตามตัวเลข 6 หลัก"
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
