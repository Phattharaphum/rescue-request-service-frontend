// src/components/citizen/rescue-request-form.tsx
'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  HeartPulse,
  Info,
  LocateFixed,
  MapPinned,
  PackageOpen,
  Route,
  Search,
  Send,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ErrorAlert } from '@/components/shared/error-alert';
import { SpecialNeedsInput } from '@/components/citizen/special-needs-input';
import { rescueRequestSchema, RescueRequestFormValues } from '@/lib/schemas/citizen';
import { createRescueRequest } from '@/lib/api/rescue';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import { useIncidents } from '@/lib/hooks/use-incidents';
import { parseSpecialNeeds } from '@/lib/utils/special-needs';
import {
  REQUEST_TYPE_OPTIONS,
  type SupportedRequestType,
} from '@/lib/config/request-types';

interface RescueRequestFormProps {
  initialRequestType?: SupportedRequestType;
  onSuccess: (data: {
    requestId: string;
    trackingCode: string;
    status: string;
    submittedAt: string;
  }) => void;
}

const REQUEST_TYPE_UI: Record<
  SupportedRequestType,
  {
    icon: LucideIcon;
    card: string;
    selected: string;
    iconBox: string;
    rail: string;
    chip: string;
    description: string;
  }
> = {
  MEDICAL: {
    icon: HeartPulse,
    card: 'border-rose-200 bg-rose-50 hover:bg-rose-100',
    selected: 'border-rose-500 bg-rose-100',
    iconBox: 'bg-rose-500 text-white',
    rail: 'bg-rose-500',
    chip: 'border-rose-200 bg-rose-50 text-rose-700',
    description: 'ยา เวชภัณฑ์ ผู้ป่วยฉุกเฉิน หรือความเสี่ยงด้านสุขภาพ',
  },
  EVACUATION: {
    icon: Route,
    card: 'border-amber-200 bg-amber-50 hover:bg-amber-100',
    selected: 'border-amber-500 bg-amber-100',
    iconBox: 'bg-amber-300 text-slate-950',
    rail: 'bg-amber-300',
    chip: 'border-amber-200 bg-amber-50 text-amber-700',
    description: 'ติดค้าง ต้องอพยพ หรือเคลื่อนย้ายออกจากพื้นที่เสี่ยง',
  },
  SUPPLY: {
    icon: PackageOpen,
    card: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
    selected: 'border-emerald-500 bg-emerald-100',
    iconBox: 'bg-emerald-500 text-white',
    rail: 'bg-emerald-500',
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    description: 'อาหาร น้ำดื่ม และเสบียงจำเป็นสำหรับผู้ประสบภัย',
  },
};

function SectionHeader({
  index,
  title,
  description,
  icon,
}: {
  index: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black text-cyan-700">Step {index}</p>
        <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">{title}</h2>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{description}</p>
      </div>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
        {icon}
      </div>
    </div>
  );
}

function ReviewBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black text-slate-500">{label}</p>
      <div className="mt-1 break-words text-sm font-bold leading-6 text-slate-950">{children}</div>
    </div>
  );
}

export function RescueRequestForm({ initialRequestType, onSuccess }: RescueRequestFormProps) {
  const { incidents, isLoading: isLoadingIncidents, isError: isIncidentsError } = useIncidents();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false);
  const [incidentSearch, setIncidentSearch] = useState('');
  const [pendingSubmission, setPendingSubmission] = useState<RescueRequestFormValues | null>(null);
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RescueRequestFormValues>({
    resolver: zodResolver(rescueRequestSchema) as unknown as Resolver<RescueRequestFormValues>,
    defaultValues: {
      incidentId: '',
      requestType: initialRequestType,
      peopleCount: 1,
      sourceChannel: 'WEB',
    },
  });

  useEffect(() => {
    if (!initialRequestType) return;
    setValue('requestType', initialRequestType, { shouldDirty: true, shouldValidate: true });
  }, [initialRequestType, setValue]);

  const currentRequestType = watch('requestType');
  const selectedRequestTypeOption = currentRequestType
    ? REQUEST_TYPE_OPTIONS.find((option) => option.value === currentRequestType)
    : undefined;
  const selectedRequestTypeMeta = currentRequestType
    ? REQUEST_TYPE_UI[currentRequestType]
    : undefined;

  const filteredIncidents = useMemo(() => {
    const query = incidentSearch.trim().toLowerCase();
    if (!query) return incidents;

    return incidents.filter((incident) =>
      `${incident.label} ${incident.description}`.toLowerCase().includes(query),
    );
  }, [incidentSearch, incidents]);

  const selectedReviewIncident = useMemo(
    () =>
      pendingSubmission
        ? incidents.find((incident) => incident.value === pendingSubmission.incidentId)
        : undefined,
    [incidents, pendingSubmission],
  );

  const selectedReviewRequestType = useMemo(
    () =>
      pendingSubmission
        ? REQUEST_TYPE_OPTIONS.find((option) => option.value === pendingSubmission.requestType)
        : undefined,
    [pendingSubmission],
  );

  const reviewSpecialNeeds = parseSpecialNeeds(pendingSubmission?.specialNeeds);

  const mockGpsLocation = () => {
    const lat = Number((5.6 + Math.random() * 14.1).toFixed(6));
    const lng = Number((97.3 + Math.random() * 8.2).toFixed(6));

    setValue('latitude', lat, { shouldDirty: true, shouldValidate: true });
    setValue('longitude', lng, { shouldDirty: true, shouldValidate: true });
  };

  const submitRequest = async (data: RescueRequestFormValues) => {
    setApiError(null);
    setIsConfirmSubmitting(true);

    try {
      const result = await createRescueRequest(data, generateIdempotencyKey());
      onSuccess({
        requestId: result.requestId,
        trackingCode: result.trackingCode,
        status: result.status,
        submittedAt: result.submittedAt,
      });
    } catch (error: unknown) {
      setApiError((error as { message?: string })?.message ?? 'ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      setIsReviewOpen(false);
    } finally {
      setIsConfirmSubmitting(false);
    }
  };

  const onSubmit = (data: RescueRequestFormValues) => {
    setPendingSubmission(data);
    setIsReviewOpen(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {apiError && <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />}

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex gap-3">
            <Info size={20} className="mt-0.5 shrink-0 text-blue-700" />
            <div>
              <p className="text-sm font-black text-blue-900">
                ระบุข้อมูลให้ครบถ้วนเพื่อให้ทีมช่วยเหลือไปถึงจุดเกิดเหตุได้เร็วขึ้น
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-blue-700">
                ตำแหน่งที่ชัดเจน จำนวนผู้ประสบภัย และเบอร์ติดต่อที่ถูกต้อง ช่วยลดเวลาประสานงาน
              </p>
            </div>
          </div>
        </div>

        <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <SectionHeader
            index="01"
            title="ข้อมูลเหตุการณ์"
            description="เลือกเหตุการณ์ภัยพิบัติและประเภทความช่วยเหลือที่ต้องการ"
            icon={<FileText size={22} />}
          />

          <div className="grid gap-4">
            <Controller
              name="incidentId"
              control={control}
              render={({ field }) => {
                const selectedIncident = incidents.find((incident) => incident.value === field.value);
                const canSelectIncident =
                  !isLoadingIncidents && !isIncidentsError && incidents.length > 0;

                return (
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">
                      เหตุการณ์ภัยพิบัติ <span className="text-rose-500">*</span>
                    </label>

                    <button
                      type="button"
                      disabled={!canSelectIncident}
                      onClick={() => setIsIncidentDialogOpen(true)}
                      className={`w-full rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        selectedIncident
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="flex min-w-0 items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              selectedIncident
                                ? 'bg-cyan-300 text-slate-950'
                                : 'bg-amber-200 text-slate-950'
                            }`}
                          >
                            {selectedIncident ? <CheckCircle2 size={22} /> : <MapPinned size={22} />}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-black text-slate-950">
                              {selectedIncident ? selectedIncident.label : 'ยังไม่ได้เลือกเหตุการณ์'}
                            </span>
                            <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">
                              {isLoadingIncidents
                                ? 'กำลังโหลดเหตุการณ์...'
                                : isIncidentsError
                                  ? 'ไม่สามารถโหลดเหตุการณ์ได้'
                                  : selectedIncident
                                    ? selectedIncident.description
                                    : 'กดเพื่อเปิดหน้าต่างเลือกเหตุการณ์ภัยพิบัติ'}
                            </span>
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black ${
                            selectedIncident
                              ? 'border-cyan-200 bg-white text-cyan-700'
                              : 'border-amber-300 bg-white text-amber-700'
                          }`}
                        >
                          {selectedIncident ? 'เลือกแล้ว' : 'ต้องเลือก'}
                        </span>
                      </div>
                    </button>

                    {errors.incidentId?.message && (
                      <p className="mt-2 text-sm font-semibold text-rose-600">
                        {errors.incidentId.message}
                      </p>
                    )}

                    <Dialog
                      isOpen={isIncidentDialogOpen}
                      onClose={() => setIsIncidentDialogOpen(false)}
                      size="lg"
                      title="เลือกเหตุการณ์ภัยพิบัติ"
                      description="ค้นหาและเลือกเหตุการณ์ที่ตรงกับพื้นที่หรือสถานการณ์ของคุณ"
                    >
                      <div className="space-y-4">
                        <div className="relative">
                          <Search
                            size={18}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            value={incidentSearch}
                            onChange={(event) => setIncidentSearch(event.target.value)}
                            placeholder="ค้นหาชื่อเหตุการณ์หรือรายละเอียด"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-semibold text-slate-950 outline-none transition-colors focus:border-cyan-400 focus:bg-white"
                          />
                          {incidentSearch && (
                            <button
                              type="button"
                              onClick={() => setIncidentSearch('')}
                              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500"
                              aria-label="ล้างคำค้นหา"
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>

                        <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
                          {filteredIncidents.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
                              ไม่พบเหตุการณ์ที่ตรงกับคำค้นหา
                            </div>
                          ) : (
                            filteredIncidents.map((incident) => {
                              const selected = field.value === incident.value;

                              return (
                                <button
                                  key={incident.value}
                                  type="button"
                                  onClick={() => {
                                    field.onChange(incident.value);
                                    setIsIncidentDialogOpen(false);
                                    setIncidentSearch('');
                                  }}
                                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                                    selected
                                      ? 'border-cyan-500 bg-cyan-50'
                                      : 'border-slate-200 bg-white hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <span
                                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                        selected
                                          ? 'bg-cyan-300 text-slate-950'
                                          : 'bg-slate-100 text-slate-500'
                                      }`}
                                    >
                                      {selected ? <CheckCircle2 size={20} /> : <MapPinned size={20} />}
                                    </span>
                                    <span>
                                      <span className="block text-sm font-black text-slate-950">
                                        {incident.label}
                                      </span>
                                      <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
                                        {incident.description}
                                      </span>
                                    </span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </Dialog>
                  </div>
                );
              }}
            />

            <Controller
              name="requestType"
              control={control}
              render={({ field }) => (
                <div>
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="block text-sm font-black text-slate-700">
                      ประเภทความช่วยเหลือ <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${
                        selectedRequestTypeMeta
                          ? selectedRequestTypeMeta.chip
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {selectedRequestTypeOption
                        ? `กำลังเลือก: ${selectedRequestTypeOption.shortLabel}`
                        : 'ยังไม่ได้เลือกประเภท'}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {REQUEST_TYPE_OPTIONS.map((option) => {
                      const meta = REQUEST_TYPE_UI[option.value];
                      const Icon = meta.icon;
                      const selected = field.value === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          aria-pressed={selected}
                          className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-colors active:scale-[0.99] ${
                            selected ? meta.selected : meta.card
                          }`}
                        >
                          {selected && (
                            <span className={`absolute left-0 top-0 h-full w-2 ${meta.rail}`} />
                          )}
                          <div className="flex items-start justify-between gap-3 pl-1">
                            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${meta.iconBox}`}>
                              <Icon size={23} />
                            </span>
                            {selected && (
                              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-700">
                                เลือกอยู่
                              </span>
                            )}
                          </div>
                          <span className="mt-4 block pl-1 text-base font-black text-slate-950">
                            {option.shortLabel}
                          </span>
                          <span className="mt-1 block pl-1 text-xs font-semibold leading-5 text-slate-600">
                            {meta.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedRequestTypeOption && selectedRequestTypeMeta && (
                    <div
                      className={`mt-3 rounded-2xl border p-4 ${selectedRequestTypeMeta.chip}`}
                    >
                      <p className="text-xs font-black">ประเภทที่เลือก</p>
                      <p className="mt-1 text-sm font-black text-slate-950">
                        {selectedRequestTypeOption.label}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                        {selectedRequestTypeMeta.description}
                      </p>
                    </div>
                  )}

                  {errors.requestType?.message && (
                    <p className="mt-2 text-sm font-semibold text-rose-600">
                      {errors.requestType.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Textarea
              label="รายละเอียดสถานการณ์"
              required
              placeholder="เช่น มีผู้ป่วยติดอยู่ในบ้าน น้ำท่วมสูง ต้องการยาและเรือช่วยเหลือ"
              {...register('description')}
              error={errors.description?.message}
            />

            <Input
              label="จำนวนผู้ประสบภัย"
              required
              type="number"
              min={1}
              step={1}
              {...register('peopleCount')}
              error={errors.peopleCount?.message}
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <SectionHeader
            index="02"
            title="ตำแหน่งและพื้นที่"
            description="ระบุพิกัดและจุดสังเกตเพื่อให้ทีมช่วยเหลือค้นหาได้ง่าย"
            icon={<LocateFixed size={22} />}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={mockGpsLocation}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition-colors hover:bg-slate-800 sm:w-auto"
              >
                <LocateFixed size={17} />
                เติมพิกัดตัวอย่าง
              </button>
            </div>

            <Input
              label="ละติจูด"
              required
              type="number"
              step="any"
              placeholder="เช่น 13.756331"
              {...register('latitude')}
              error={errors.latitude?.message}
            />
            <Input
              label="ลองจิจูด"
              required
              type="number"
              step="any"
              placeholder="เช่น 100.501762"
              {...register('longitude')}
              error={errors.longitude?.message}
            />
            <Textarea
              label="จุดสังเกตเพิ่มเติม"
              placeholder="เช่น บ้านหลังคาสีฟ้า ใกล้วัด หรือหน้าปากซอย"
              className="sm:col-span-2"
              {...register('locationDetails')}
              error={errors.locationDetails?.message}
            />
            <Input
              label="ที่อยู่"
              placeholder="บ้านเลขที่ ถนน หรือชื่อชุมชน"
              className="sm:col-span-2"
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
              className="sm:col-span-2"
              {...register('province')}
              error={errors.province?.message}
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <SectionHeader
            index="03"
            title="ข้อมูลติดต่อ"
            description="ข้อมูลนี้ใช้สำหรับประสานงานกับทีมช่วยเหลือเท่านั้น"
            icon={<UserRound size={22} />}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="ชื่อ-นามสกุล ผู้ติดต่อ"
              required
              placeholder="เช่น พรทิพย์ สุขใจ"
              {...register('contactName')}
              error={errors.contactName?.message}
            />
            <Input
              label="เบอร์โทรศัพท์ที่ติดต่อได้"
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
            <Controller
              name="specialNeeds"
              control={control}
              render={({ field }) => (
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    ความต้องการพิเศษ (ถ้ามี)
                  </label>
                  <SpecialNeedsInput value={field.value} onChange={field.onChange} />
                  {errors.specialNeeds && (
                    <p className="mt-1 text-sm font-semibold text-rose-600">
                      {errors.specialNeeds.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </section>

        <input type="hidden" value="WEB" {...register('sourceChannel')} />

        <div className="border-t border-slate-200 pt-5">
          <Button
            type="submit"
            className="h-12 w-full rounded-2xl bg-slate-950 px-8 font-black text-white hover:bg-slate-800"
            size="lg"
            loading={isSubmitting || isConfirmSubmitting}
            disabled={isSubmitting || isConfirmSubmitting}
            leftIcon={!isSubmitting && !isConfirmSubmitting ? <Send size={18} /> : undefined}
          >
            {isSubmitting || isConfirmSubmitting ? 'กำลังส่งคำขอ...' : 'ตรวจสอบก่อนส่งคำขอ'}
          </Button>
        </div>
      </form>

      <Dialog
        isOpen={isReviewOpen}
        onClose={() => {
          if (isConfirmSubmitting) return;
          setIsReviewOpen(false);
        }}
        size="lg"
        title="ตรวจสอบข้อมูลก่อนส่ง"
        description="กรุณาตรวจสอบรายละเอียดคำขอให้ถูกต้อง ก่อนยืนยันส่งเข้าระบบ"
      >
        {pendingSubmission && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="text-xs font-black text-cyan-700">เหตุการณ์ภัยพิบัติ</p>
              <p className="mt-1 text-sm font-bold leading-6 text-cyan-950">
                {selectedReviewIncident?.description ?? pendingSubmission.incidentId}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ReviewBlock label="ประเภทความช่วยเหลือ">
                {selectedReviewRequestType?.label ?? pendingSubmission.requestType}
              </ReviewBlock>
              <ReviewBlock label="จำนวนผู้ประสบภัย">
                {pendingSubmission.peopleCount.toLocaleString('th-TH')} คน
              </ReviewBlock>
              <ReviewBlock label="ผู้ติดต่อ">{pendingSubmission.contactName}</ReviewBlock>
              <ReviewBlock label="เบอร์โทรศัพท์">{pendingSubmission.contactPhone}</ReviewBlock>
            </div>

            <ReviewBlock label="รายละเอียดสถานการณ์">
              <span className="whitespace-pre-wrap">{pendingSubmission.description}</span>
            </ReviewBlock>

            <ReviewBlock label="ตำแหน่งและที่อยู่">
              <div className="space-y-1">
                <p>
                  พิกัด: {pendingSubmission.latitude}, {pendingSubmission.longitude}
                </p>
                {pendingSubmission.locationDetails && (
                  <p>จุดสังเกต: {pendingSubmission.locationDetails}</p>
                )}
                <p>
                  {[
                    pendingSubmission.addressLine,
                    pendingSubmission.subdistrict,
                    pendingSubmission.district,
                    pendingSubmission.province,
                  ]
                    .filter(Boolean)
                    .join(' ') || '-'}
                </p>
              </div>
            </ReviewBlock>

            {pendingSubmission.specialNeeds && (
              <ReviewBlock label="ความต้องการพิเศษ">
                {reviewSpecialNeeds.mode === 'chip' && reviewSpecialNeeds.items?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {reviewSpecialNeeds.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  reviewSpecialNeeds.text || pendingSubmission.specialNeeds
                )}
              </ReviewBlock>
            )}

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={isConfirmSubmitting}
                onClick={() => setIsReviewOpen(false)}
                className="flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                กลับไปแก้ไข
              </button>
              <button
                type="button"
                disabled={isConfirmSubmitting}
                onClick={() => void submitRequest(pendingSubmission)}
                className="flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                {isConfirmSubmitting ? 'กำลังส่งคำขอ...' : 'ยืนยันส่งคำขอ'}
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {apiError && (
        <Dialog
          isOpen={!!apiError}
          onClose={() => setApiError(null)}
          size="md"
          title="ส่งคำขอไม่สำเร็จ"
          description="กรุณาตรวจสอบข้อมูลและลองส่งอีกครั้ง"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
              <p className="text-sm font-semibold leading-6 text-rose-800">{apiError}</p>
            </div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="flex h-11 w-full items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition-colors hover:bg-slate-800"
            >
              กลับไปแก้ไขข้อมูล
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
