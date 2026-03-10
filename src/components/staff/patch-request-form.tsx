'use client';

import { useState } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { ErrorAlert } from '@/components/shared/error-alert';
import { SpecialNeedsInput } from '@/components/citizen/special-needs-input';
import { useToast } from '@/components/ui/toast';
import { patchRequestSchema, PatchRequestFormValues } from '@/lib/schemas/staff';
import { patchRequest } from '@/lib/api/rescue';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import { RescueRequestMaster } from '@/types/rescue';

interface PatchRequestFormProps {
  requestId: string;
  stateVersion: number;
  currentData: Partial<RescueRequestMaster>;
  onSuccess?: () => void;
}

export function PatchRequestForm({
  requestId,
  stateVersion,
  currentData,
  onSuccess,
}: PatchRequestFormProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<PatchRequestFormValues>({
    resolver: zodResolver(patchRequestSchema) as unknown as Resolver<PatchRequestFormValues>,
    defaultValues: {
      description: currentData.description ?? '',
      peopleCount: currentData.peopleCount,
      specialNeeds: currentData.specialNeeds ?? '',
      locationDetails: currentData.locationDetails ?? '',
      addressLine: currentData.addressLine ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PatchRequestFormValues) => {
      const key = generateIdempotencyKey();
      const ifMatch = String(stateVersion);
      return patchRequest(requestId, data, key, ifMatch);
    },
    onSuccess: () => {
      toast.show('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const e = err as { status?: number; message?: string };
      if (e?.status === 409) {
        setApiError('ข้อมูลถูกอัปเดตโดยผู้อื่น กรุณารีเฟรชหน้าและลองใหม่อีกครั้ง');
      } else {
        setApiError(e?.message ?? 'เกิดข้อผิดพลาด');
      }
    },
  });

  const onSubmit = (data: PatchRequestFormValues) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader title="แก้ไขข้อมูลคำขอ" />
      <CardContent>
        <form
          id="patch-request-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          {apiError && (
            <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            <span>เวอร์ชันข้อมูล:</span>
            <span className="font-mono font-semibold text-gray-700">v{stateVersion}</span>
          </div>

          <Textarea
            label="รายละเอียด"
            placeholder="อธิบายสถานการณ์..."
            {...register('description')}
            error={errors.description?.message}
          />

          <Input
            label="จำนวนผู้ประสบภัย"
            type="number"
            min={1}
            {...register('peopleCount')}
            error={errors.peopleCount?.message}
          />

          <Textarea
            label="รายละเอียดสถานที่"
            placeholder="รายละเอียดสถานที่..."
            rows={2}
            {...register('locationDetails')}
            error={errors.locationDetails?.message}
          />

          <Input
            label="ที่อยู่"
            placeholder="เลขที่ ถนน ซอย..."
            {...register('addressLine')}
            error={errors.addressLine?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ความต้องการพิเศษ
            </label>
            <Controller
              name="specialNeeds"
              control={control}
              render={({ field }) => (
                <SpecialNeedsInput
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.specialNeeds && (
              <p className="mt-1 text-sm text-red-600">{errors.specialNeeds.message}</p>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="patch-request-form"
          variant="primary"
          loading={mutation.isPending}
          disabled={mutation.isPending || !isDirty}
        >
          {mutation.isPending ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
        </Button>
      </CardFooter>
    </Card>
  );
}
