'use client';

import { useRef, useState } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LocateFixed, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ErrorAlert } from '@/components/shared/error-alert';
import { SpecialNeedsInput } from '@/components/citizen/special-needs-input';
import { rescueRequestSchema, RescueRequestFormValues } from '@/lib/schemas/citizen';
import { ApiRequestError } from '@/lib/api/client';
import { createRescueRequest } from '@/lib/api/rescue';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import { INCIDENTS } from '@/lib/config/incidents';

const REQUEST_TYPE_OPTIONS = [
  { value: 'EVACUATION', label: 'อพยพออกจากพื้นที่' },
  { value: 'SUPPLY', label: 'อาหาร / น้ำดื่ม / เสบียง' },
  { value: 'MEDICAL', label: 'การแพทย์ / ยา / ผู้ป่วยฉุกเฉิน' },
  { value: 'OTHER', label: 'เครื่องใช้จำเป็น' },
];

const INCIDENT_OPTIONS = INCIDENTS.map((i) => ({ value: i.value, label: i.label }));
const MAX_CREATE_RETRIES = 3;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransactionConflict(err: unknown): boolean {
  if (err instanceof ApiRequestError) {
    const msg = `${err.error?.message ?? ''} ${err.error?.code ?? ''}`.toLowerCase();
    return err.status === 409 || msg.includes('transaction conflict') || msg.includes('transactionconflict');
  }

  const fallbackMessage = String((err as { message?: string })?.message ?? '').toLowerCase();
  return fallbackMessage.includes('transaction conflict') || fallbackMessage.includes('transactionconflict');
}

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
  const [isMockingLocation, setIsMockingLocation] = useState(false);
  const submitLockRef = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RescueRequestFormValues>({
    resolver: zodResolver(rescueRequestSchema) as unknown as Resolver<RescueRequestFormValues>,
    defaultValues: {
      incidentId: INCIDENTS[0]?.value ?? '',
      peopleCount: 1,
      sourceChannel: 'WEB',
    },
  });
  const mockGpsLocation = () => {
    setIsMockingLocation(true);

    const lat = Number((5.6 + Math.random() * 14.1).toFixed(6));
    const lng = Number((97.3 + Math.random() * 8.2).toFixed(6));

    setValue('latitude', lat, { shouldDirty: true, shouldValidate: true });
    setValue('longitude', lng, { shouldDirty: true, shouldValidate: true });

    window.setTimeout(() => setIsMockingLocation(false), 400);
  };

  const onSubmit = async (data: RescueRequestFormValues) => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setApiError(null);

    try {
      const key = generateIdempotencyKey();
      let result;
      let lastError: unknown;

      for (let attempt = 1; attempt <= MAX_CREATE_RETRIES; attempt += 1) {
        try {
          result = await createRescueRequest(data, key);
          break;
        } catch (err: unknown) {
          lastError = err;

          if (!isTransactionConflict(err) || attempt === MAX_CREATE_RETRIES) {
            throw err;
          }

          await wait(attempt * 300);
        }
      }

      if (!result) {
        throw lastError ?? new Error('Failed to create rescue request');
      }

      onSuccess({
        requestId: result.requestId,
        trackingCode: result.trackingCode,
        status: result.status,
        submittedAt: result.submittedAt,
      });
    } catch (err: unknown) {
      if (isTransactionConflict(err)) {
        setApiError('System is busy processing requests. Please submit again in 2-3 seconds.');
      } else {
        const e = err as { message?: string };
        setApiError(e?.message ?? 'Request failed. Please try again.');
      }
    } finally {
      submitLockRef.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {apiError && <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />}

      <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="mt-0.5 text-teal-600" />
          <div>
            <p className="text-sm font-semibold text-teal-900">แจ้งข้อมูลให้ครบเพื่อช่วยให้ทีมเข้าถึงได้เร็วขึ้น</p>
            <p className="mt-1 text-sm text-teal-800">
              เลือกประเภทคำขอ, กดดึงพิกัด, และกรอกข้อมูลติดต่อให้ถูกต้อง
            </p>
          </div>
        </div>
      </div>

      <Card className="border-teal-100">
        <CardHeader title="ข้อมูลเหตุการณ์" className="bg-teal-50/70" />
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  placeholder="กรุณาเลือกประเภทคำขอ"
                  value={field.value ?? ''}
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

      <Card className="border-teal-100">
        <CardHeader title="ตำแหน่งที่เกิดเหตุ" className="bg-teal-50/70" />
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                leftIcon={<LocateFixed size={16} />}
                loading={isMockingLocation}
                onClick={mockGpsLocation}
                className="w-full sm:w-auto"
              >
                {isMockingLocation ? 'กำลังดึงตำแหน่งจำลอง...' : 'ดึงตำแหน่ง GPS (จำลอง)'}
              </Button>
            </div>
            <Input
              label="ละติจูด"
              required
              type="number"
              step="any"
              readOnly
              placeholder="กดปุ่มเพื่อดึงตำแหน่ง"
              {...register('latitude')}
              error={errors.latitude?.message}
            />
            <Input
              label="ลองจิจูด"
              required
              type="number"
              step="any"
              readOnly
              placeholder="กดปุ่มเพื่อดึงตำแหน่ง"
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

      <Card className="border-teal-100">
        <CardHeader title="ข้อมูลผู้ติดต่อ" className="bg-teal-50/70" />
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              inputMode="numeric"
              autoComplete="tel-national"
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
          </div>
        </CardContent>
      </Card>

      <Card className="border-teal-100">
        <CardHeader title="ความต้องการพิเศษ (ถ้ามี)" className="bg-teal-50/70" />
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

      <input type="hidden" value="WEB" {...register('sourceChannel')} />

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
