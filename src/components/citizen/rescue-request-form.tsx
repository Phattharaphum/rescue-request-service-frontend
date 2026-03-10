'use client';

import { useState } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ErrorAlert } from '@/components/shared/error-alert';
import { SpecialNeedsInput } from '@/components/citizen/special-needs-input';
import { rescueRequestSchema, RescueRequestFormValues } from '@/lib/schemas/citizen';
import { createRescueRequest } from '@/lib/api/rescue';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import { INCIDENTS } from '@/lib/config/incidents';

const REQUEST_TYPE_OPTIONS = [
  { value: 'MEDICAL', label: 'การแพทย์/ผู้ป่วย' },
  { value: 'RESCUE', label: 'ช่วยเหลือ/กู้ภัย' },
  { value: 'EVACUATION', label: 'อพยพ' },
  { value: 'SUPPLY', label: 'เสบียง/สิ่งของ' },
  { value: 'OTHER', label: 'อื่นๆ' },
];

const SOURCE_CHANNEL_OPTIONS = [
  { value: 'WEB', label: 'เว็บไซต์' },
  { value: 'MOBILE', label: 'แอปมือถือ' },
  { value: 'CALL_CENTER', label: 'ศูนย์โทรศัพท์' },
  { value: 'LINE', label: 'LINE' },
  { value: 'OTHER', label: 'อื่นๆ' },
];

const INCIDENT_OPTIONS = INCIDENTS.map((i) => ({ value: i.value, label: i.label }));

interface RescueRequestFormProps {
  onSuccess: (data: {
    requestId: string;
    trackingCode: string;
    status: string;
    submittedAt: string;
  }) => void;
}

export function RescueRequestForm({ onSuccess }: RescueRequestFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RescueRequestFormValues>({
    resolver: zodResolver(rescueRequestSchema) as unknown as Resolver<RescueRequestFormValues>,
    defaultValues: {
      incidentId: INCIDENTS[0]?.value ?? '',
      peopleCount: 1,
    },
  });

  const onSubmit = async (data: RescueRequestFormValues) => {
    setApiError(null);
    try {
      const key = generateIdempotencyKey();
      const result = await createRescueRequest(data, key);
      onSuccess({
        requestId: result.requestId,
        trackingCode: result.trackingCode,
        status: result.status,
        submittedAt: result.submittedAt,
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setApiError(e?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {apiError && <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />}

      {/* Section 1: ข้อมูลเหตุการณ์ */}
      <Card>
        <CardHeader title="ข้อมูลเหตุการณ์" />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="incidentId"
              control={control}
              render={({ field }) => (
                <Select
                  label="เหตุการณ์"
                  required
                  options={INCIDENT_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.incidentId?.message}
                />
              )}
            />
            <Controller
              name="requestType"
              control={control}
              render={({ field }) => (
                <Select
                  label="ประเภทคำขอช่วยเหลือ"
                  required
                  options={REQUEST_TYPE_OPTIONS}
                  placeholder="เลือกประเภท..."
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.requestType?.message}
                />
              )}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="อธิบายสถานการณ์"
                required
                placeholder="อธิบายสถานการณ์ฉุกเฉินโดยละเอียด..."
                {...register('description')}
                error={errors.description?.message}
              />
            </div>
            <Input
              label="จำนวนผู้ประสบภัย"
              required
              type="number"
              min={1}
              {...register('peopleCount')}
              error={errors.peopleCount?.message}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: ตำแหน่งที่เกิดเหตุ */}
      <Card>
        <CardHeader title="ตำแหน่งที่เกิดเหตุ" />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="ละติจูด"
              required
              type="number"
              step="any"
              placeholder="เช่น 13.7563"
              {...register('latitude')}
              error={errors.latitude?.message}
            />
            <Input
              label="ลองจิจูด"
              required
              type="number"
              step="any"
              placeholder="เช่น 100.5018"
              {...register('longitude')}
              error={errors.longitude?.message}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="รายละเอียดสถานที่"
                placeholder="เช่น บ้านเลขที่ ชื่ออาคาร จุดสังเกต..."
                {...register('locationDetails')}
                error={errors.locationDetails?.message}
                rows={2}
              />
            </div>
            <Input
              label="จังหวัด"
              placeholder="เช่น กรุงเทพมหานคร"
              {...register('province')}
              error={errors.province?.message}
            />
            <Input
              label="อำเภอ/เขต"
              placeholder="เช่น บางรัก"
              {...register('district')}
              error={errors.district?.message}
            />
            <Input
              label="ตำบล/แขวง"
              placeholder="เช่น สีลม"
              {...register('subdistrict')}
              error={errors.subdistrict?.message}
            />
            <Input
              label="ที่อยู่"
              placeholder="เลขที่ ถนน ซอย..."
              {...register('addressLine')}
              error={errors.addressLine?.message}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: ข้อมูลผู้ติดต่อ */}
      <Card>
        <CardHeader title="ข้อมูลผู้ติดต่อ" />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="ชื่อผู้ติดต่อ"
              required
              placeholder="ชื่อ-นามสกุล"
              {...register('contactName')}
              error={errors.contactName?.message}
            />
            <Input
              label="เบอร์โทรศัพท์"
              required
              type="tel"
              placeholder="0812345678"
              {...register('contactPhone')}
              error={errors.contactPhone?.message}
            />
            <Controller
              name="sourceChannel"
              control={control}
              render={({ field }) => (
                <Select
                  label="ช่องทางการแจ้ง"
                  required
                  options={SOURCE_CHANNEL_OPTIONS}
                  placeholder="เลือกช่องทาง..."
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.sourceChannel?.message}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: ความต้องการพิเศษ */}
      <Card>
        <CardHeader title="ความต้องการพิเศษ (ถ้ามี)" />
        <CardContent>
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
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอช่วยเหลือ'}
        </Button>
      </div>
    </form>
  );
}
