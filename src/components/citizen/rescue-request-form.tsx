// src/components/citizen/rescue-request-form.tsx
'use client';

import { useRef, useState } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LocateFixed, Info } from 'lucide-react';
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
  { value: 'OTHER', label: 'เครื่องใช้จำเป็นอื่นๆ' },
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

    window.setTimeout(() => setIsMockingLocation(false), 500);
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
        throw lastError ?? new Error('ไม่สามารถบันทึกคำขอได้');
      }

      onSuccess({
        requestId: result.requestId,
        trackingCode: result.trackingCode,
        status: result.status,
        submittedAt: result.submittedAt,
      });
    } catch (err: unknown) {
      if (isTransactionConflict(err)) {
        setApiError('ระบบกำลังประมวลผลคำขอจำนวนมาก กรุณากดส่งอีกครั้งใน 2-3 วินาที');
      } else {
        const e = err as { message?: string };
        setApiError(e?.message ?? 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      submitLockRef.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {apiError && <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />}

      {/* Info Banner */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-5 py-4">
        <div className="flex items-start gap-3">
          <Info size={20} className="mt-0.5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-bold text-blue-900">ระบุข้อมูลให้ครบถ้วนเพื่อความรวดเร็ว</p>
            <p className="mt-1 text-sm text-blue-700 leading-relaxed">
              การระบุตำแหน่งที่ชัดเจนและข้อมูลติดต่อที่ถูกต้อง จะช่วยให้ทีมเจ้าหน้าที่เข้าช่วยเหลือได้ตรงจุดและรวดเร็วที่สุด
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Incident Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">1. ข้อมูลเหตุการณ์</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            name="incidentId"
            control={control}
            render={({ field }) => (
              <Select
                label="เหตุการณ์ภัยพิบัติ"
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
                label="ประเภทความช่วยเหลือที่ต้องการ"
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
              label="อธิบายสถานการณ์โดยละเอียด"
              required
              placeholder="เช่น ระดับน้ำสูงประมาณ 1 เมตร, มีผู้ป่วยติดเตียงต้องการอพยพด่วน..."
              {...register('description')}
              error={errors.description?.message}
              rows={3}
            />
          </div>
          <Input
            label="จำนวนผู้ประสบภัย (คน)"
            required
            type="number"
            min={1}
            {...register('peopleCount')}
            error={errors.peopleCount?.message}
          />
        </div>
      </section>

      {/* Section 2: Location */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-2 gap-3">
          <h2 className="text-lg font-bold text-gray-900">2. ตำแหน่งที่เกิดเหตุ</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<LocateFixed size={16} />}
            loading={isMockingLocation}
            onClick={mockGpsLocation}
            className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          >
            {isMockingLocation ? 'กำลังค้นหาตำแหน่ง...' : 'ดึงตำแหน่ง GPS ปัจจุบัน (จำลอง)'}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="ละติจูด (Latitude)"
            required
            type="number"
            step="any"
            readOnly
            className="bg-gray-50 text-gray-500"
            placeholder="กดปุ่มเพื่อดึงตำแหน่งอัตโนมัติ"
            {...register('latitude')}
            error={errors.latitude?.message}
          />
          <Input
            label="ลองจิจูด (Longitude)"
            required
            type="number"
            step="any"
            readOnly
            className="bg-gray-50 text-gray-500"
            placeholder="กดปุ่มเพื่อดึงตำแหน่งอัตโนมัติ"
            {...register('longitude')}
            error={errors.longitude?.message}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="จุดสังเกตเพิ่มเติม (ถ้ามี)"
              placeholder="เช่น บ้านสองชั้นสีฟ้า ตรงข้ามวัด..."
              {...register('locationDetails')}
              error={errors.locationDetails?.message}
              rows={2}
            />
          </div>
          <Input
            label="ที่อยู่ / หมู่บ้าน / ซอย"
            placeholder="เช่น 123/45 ซอยสุขใจ ถนนร่วมใจ..."
            {...register('addressLine')}
            error={errors.addressLine?.message}
          />
          <Input
            label="ตำบล / แขวง"
            placeholder="เช่น สีลม"
            {...register('subdistrict')}
            error={errors.subdistrict?.message}
          />
          <Input
            label="อำเภอ / เขต"
            placeholder="เช่น บางรัก"
            {...register('district')}
            error={errors.district?.message}
          />
          <Input
            label="จังหวัด"
            placeholder="เช่น กรุงเทพมหานคร"
            {...register('province')}
            error={errors.province?.message}
          />
        </div>
      </section>

      {/* Section 3: Contact & Special Needs */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">3. ข้อมูลผู้ติดต่อ</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="ชื่อ-นามสกุล ผู้ติดต่อ"
            required
            placeholder="เช่น สมชาย ใจดี"
            {...register('contactName')}
            error={errors.contactName?.message}
          />
          <Input
            label="เบอร์โทรศัพท์ที่ติดต่อได้"
            required
            type="tel"
            placeholder="เช่น 0812345678"
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
          <div className="sm:col-span-2 mt-2">
            <Controller
              name="specialNeeds"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">ความต้องการพิเศษ (ถ้ามี)</label>
                  <SpecialNeedsInput
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {errors.specialNeeds && (
                    <p className="text-sm text-red-500">{errors.specialNeeds.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </section>

      <input type="hidden" value="WEB" {...register('sourceChannel')} />

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <Button
          type="submit"
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 shadow-sm transition-all"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'กำลังส่งคำขอ...' : 'ยืนยันการส่งคำขอความช่วยเหลือ'}
        </Button>
      </div>
    </form>
  );
}