'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ErrorAlert } from '@/components/shared/error-alert';
import { SpecialNeedsInput } from '@/components/citizen/special-needs-input';
import { citizenUpdateSchema, CitizenUpdateFormValues } from '@/lib/schemas/citizen';
import { createCitizenUpdate } from '@/lib/api/rescue';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';

const UPDATE_TYPE_OPTIONS = [
  { value: 'NOTE', label: 'บันทึกเพิ่มเติม' },
  { value: 'LOCATION_DETAILS', label: 'รายละเอียดสถานที่' },
  { value: 'PEOPLE_COUNT', label: 'จำนวนผู้ประสบภัย' },
  { value: 'SPECIAL_NEEDS', label: 'ความต้องการพิเศษ' },
  { value: 'CONTACT_INFO', label: 'ข้อมูลติดต่อ' },
];

interface CitizenUpdateFormProps {
  requestId: string;
  trackingCode: string;
  onSuccess?: () => void;
}

export function CitizenUpdateForm({ requestId, trackingCode, onSuccess }: CitizenUpdateFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CitizenUpdateFormValues>({
    resolver: zodResolver(citizenUpdateSchema),
    defaultValues: {
      trackingCode,
      updateType: 'NOTE',
      updatePayload: {},
    },
  });

  const updateType = watch('updateType');

  const onSubmit = async (data: CitizenUpdateFormValues) => {
    setApiError(null);
    setSuccess(false);
    try {
      const key = generateIdempotencyKey();
      await createCitizenUpdate(requestId, data, key);
      setSuccess(true);
      reset({ trackingCode, updateType: 'NOTE', updatePayload: {} });
      onSuccess?.();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setApiError(e?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <Card>
      <CardHeader title="แจ้งข้อมูลเพิ่มเติม" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {apiError && (
            <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />
          )}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              ส่งข้อมูลเรียบร้อยแล้ว
            </div>
          )}

          <Controller
            name="updateType"
            control={control}
            render={({ field }) => (
              <Select
                label="ประเภทการอัปเดต"
                required
                options={UPDATE_TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.updateType?.message}
              />
            )}
          />

          {/* Dynamic fields based on updateType */}
          {updateType === 'NOTE' && (
            <Controller
              name="updatePayload.note"
              control={control}
              render={({ field }) => (
                <Textarea
                  label="ข้อความ"
                  required
                  placeholder="กรอกข้อความที่ต้องการแจ้ง..."
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
                  label="รายละเอียดสถานที่"
                  required
                  placeholder="อธิบายสถานที่โดยละเอียด..."
                  value={(field.value as string) ?? ''}
                  onChange={field.onChange}
                  error={(errors.updatePayload as Record<string, { message?: string }>)?.locationDetails?.message}
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
                  value={(field.value as number | string) ?? ''}
                  onChange={field.onChange}
                  error={(errors.updatePayload as Record<string, { message?: string }>)?.peopleCount?.message}
                />
              )}
            />
          )}

          {updateType === 'SPECIAL_NEEDS' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ความต้องการพิเศษ <span className="text-red-500">*</span>
              </label>
              <Controller
                name="updatePayload.specialNeeds"
                control={control}
                render={({ field }) => (
                  <SpecialNeedsInput
                    value={field.value as string | undefined}
                    onChange={field.onChange}
                  />
                )}
              />
              {(errors.updatePayload as Record<string, { message?: string }>)?.specialNeeds?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {(errors.updatePayload as Record<string, { message?: string }>).specialNeeds?.message}
                </p>
              )}
            </div>
          )}

          {updateType === 'CONTACT_INFO' && (
            <div className="space-y-3">
              <Controller
                name="updatePayload.contactName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="ชื่อผู้ติดต่อ"
                    placeholder="ชื่อ-นามสกุล"
                    value={(field.value as string) ?? ''}
                    onChange={field.onChange}
                    error={(errors.updatePayload as Record<string, { message?: string }>)?.contactName?.message}
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
                    error={(errors.updatePayload as Record<string, { message?: string }>)?.contactPhone?.message}
                  />
                )}
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อมูล'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
