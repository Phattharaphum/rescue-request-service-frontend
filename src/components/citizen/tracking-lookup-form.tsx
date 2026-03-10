'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ErrorAlert } from '@/components/shared/error-alert';
import { trackingLookupSchema, TrackingLookupFormValues } from '@/lib/schemas/citizen';
import { lookupTracking } from '@/lib/api/rescue';

interface TrackingLookupFormProps {
  onSuccess: (requestId: string, incidentId: string) => void;
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
      onSuccess(result.requestId, result.incidentId);
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e?.status === 403 || e?.status === 404) {
        setApiError('รหัสติดตามหรือเบอร์โทรไม่ถูกต้อง');
      } else {
        setApiError(e?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  return (
    <Card>
      <CardHeader title="ติดตามสถานะคำขอ" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {apiError && (
            <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />
          )}

          <Input
            label="เบอร์โทรศัพท์ที่ใช้แจ้ง"
            required
            type="tel"
            placeholder="0812345678"
            {...register('contactPhone')}
            error={errors.contactPhone?.message}
          />

          <Input
            label="รหัสติดตาม"
            required
            placeholder="กรอกรหัสติดตามที่ได้รับ"
            {...register('trackingCode')}
            error={errors.trackingCode?.message}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
            leftIcon={<Search size={16} />}
          >
            {isSubmitting ? 'กำลังค้นหา...' : 'ค้นหาสถานะ'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
