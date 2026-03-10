'use client';

import { useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
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
  { value: 'NOTE', label: 'Note' },
  { value: 'LOCATION_DETAILS', label: 'Location Details' },
  { value: 'PEOPLE_COUNT', label: 'People Count' },
  { value: 'SPECIAL_NEEDS', label: 'Special Needs' },
  { value: 'CONTACT_INFO', label: 'Contact Info' },
];

interface CitizenUpdateFormProps {
  requestId: string;
  trackingCode: string;
  onSuccess?: () => void;
}

export function CitizenUpdateForm({
  requestId,
  trackingCode,
  onSuccess,
}: CitizenUpdateFormProps) {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    handleSubmit,
    control,
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

  const updateType = useWatch({
    control,
    name: 'updateType',
  });

  const onSubmit = async (data: CitizenUpdateFormValues) => {
    setApiError(null);
    setSuccess(false);
    try {
      const key = generateIdempotencyKey();
      await createCitizenUpdate(requestId, data, key);
      await queryClient.invalidateQueries({
        queryKey: ['citizen-updates', requestId],
      });
      setSuccess(true);
      reset({ trackingCode, updateType: 'NOTE', updatePayload: {} });
      onSuccess?.();
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e?.status === 403) {
        setApiError('Tracking code is invalid');
      } else if (e?.status === 409) {
        setApiError('This request is already resolved/cancelled');
      } else {
        setApiError(e?.message ?? 'Failed to submit update. Please try again.');
      }
    }
  };

  return (
    <Card>
      <CardHeader title="Send Additional Information" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {apiError && (
            <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />
          )}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              Update submitted successfully
            </div>
          )}

          <Controller
            name="updateType"
            control={control}
            render={({ field }) => (
              <Select
                label="Update Type"
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
                  label="Note"
                  required
                  placeholder="Enter note..."
                  value={(field.value as string) ?? ''}
                  onChange={field.onChange}
                  error={
                    (errors.updatePayload as Record<string, { message?: string }>)
                      ?.note?.message
                  }
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
                  label="Location Details"
                  required
                  placeholder="Describe current location..."
                  value={(field.value as string) ?? ''}
                  onChange={field.onChange}
                  error={
                    (
                      errors.updatePayload as Record<string, { message?: string }>
                    )?.locationDetails?.message
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
                  label="People Count"
                  required
                  type="number"
                  min={1}
                  value={(field.value as number | string) ?? ''}
                  onChange={field.onChange}
                  error={
                    (
                      errors.updatePayload as Record<string, { message?: string }>
                    )?.peopleCount?.message
                  }
                />
              )}
            />
          )}

          {updateType === 'SPECIAL_NEEDS' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Needs <span className="text-red-500">*</span>
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
              {(
                errors.updatePayload as Record<string, { message?: string }>
              )?.specialNeeds?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {
                    (
                      errors.updatePayload as Record<string, { message?: string }>
                    ).specialNeeds?.message
                  }
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
                    label="Contact Name"
                    placeholder="Full name"
                    value={(field.value as string) ?? ''}
                    onChange={field.onChange}
                    error={
                      (
                        errors.updatePayload as Record<string, { message?: string }>
                      )?.contactName?.message
                    }
                  />
                )}
              />
              <Controller
                name="updatePayload.contactPhone"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Contact Phone"
                    type="tel"
                    placeholder="0812345678"
                    value={(field.value as string) ?? ''}
                    onChange={field.onChange}
                    error={
                      (
                        errors.updatePayload as Record<string, { message?: string }>
                      )?.contactPhone?.message
                    }
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
            {isSubmitting ? 'Submitting...' : 'Submit Update'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
