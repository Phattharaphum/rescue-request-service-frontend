// src/components/citizen/tracking-lookup-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ErrorAlert } from '@/components/shared/error-alert';
import { trackingLookupSchema, TrackingLookupFormValues } from '@/lib/schemas/citizen';
import { lookupTracking } from '@/lib/api/rescue';

interface TrackingLookupFormProps {
  onSuccess: (requestId: string, incidentId: string, trackingCode: string) => void;
}

export function TrackingLookupForm({ onSuccess }: TrackingLookupFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TrackingLookupFormValues>({
    resolver: zodResolver(trackingLookupSchema),
  });

  const onSubmit = async (data: TrackingLookupFormValues) => {
    setApiError(null);
    try {
      const result = await lookupTracking(data);
      onSuccess(result.requestId, result.incidentId, data.trackingCode);
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

          <Input
            label="รหัสติดตาม (Tracking Code)"
            required
            placeholder="กรอกรหัสติดตามที่ได้รับ (เช่น ABC-123)"
            className="font-mono uppercase"
            {...register('trackingCode')}
            error={errors.trackingCode?.message}
          />

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-base rounded-xl shadow-sm"
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