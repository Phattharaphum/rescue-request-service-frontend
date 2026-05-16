// src/components/citizen/rescue-request-form.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, Controller, type Resolver, type FieldError, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileWarning,
  HeartPulse,
  Info,
  LocateFixed,
  MapPin,
  PackageOpen,
  Route,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import { SpecialNeedsInput } from '@/components/citizen/special-needs-input';
import { rescueRequestSchema, RescueRequestFormValues } from '@/lib/schemas/citizen';
import { ApiRequestError } from '@/lib/api/client';
import { createRescueRequest } from '@/lib/api/rescue';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import { useIncidents } from '@/lib/hooks/use-incidents';
import { parseSpecialNeeds } from '@/lib/utils/special-needs';
import type { ApiError, ApiErrorDetail } from '@/types/api';
import {
  REQUEST_TYPE_OPTIONS,
  type SupportedRequestType,
} from '@/lib/config/request-types';

const MAX_CREATE_RETRIES = 3;
const FIELD_LABELS: Record<string, string> = {
  incidentId: 'เหตุการณ์ภัยพิบัติ',
  requestType: 'ประเภทความช่วยเหลือที่ต้องการ',
  description: 'รายละเอียดสถานการณ์',
  peopleCount: 'จำนวนผู้ประสบภัย',
  latitude: 'ละติจูด',
  longitude: 'ลองจิจูด',
  locationDetails: 'จุดสังเกตเพิ่มเติม',
  addressLine: 'ที่อยู่',
  subdistrict: 'ตำบล / แขวง',
  district: 'อำเภอ / เขต',
  province: 'จังหวัด',
  contactName: 'ชื่อผู้ติดต่อ',
  contactPhone: 'เบอร์โทรศัพท์',
  specialNeeds: 'ความต้องการพิเศษ',
};

const REQUEST_TYPE_UI: Record<
  SupportedRequestType,
  {
    icon: typeof HeartPulse;
    selectedClass: string;
    idleClass: string;
    iconSelectedClass: string;
    iconIdleClass: string;
  }
> = {
  MEDICAL: {
    icon: HeartPulse,
    selectedClass: 'border-rose-500 bg-rose-50 ring-2 ring-rose-100 shadow-sm',
    idleClass: 'border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/60',
    iconSelectedClass: 'bg-rose-600 text-white',
    iconIdleClass: 'bg-rose-100 text-rose-700',
  },
  EVACUATION: {
    icon: Route,
    selectedClass: 'border-amber-500 bg-amber-50 ring-2 ring-amber-100 shadow-sm',
    idleClass: 'border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/60',
    iconSelectedClass: 'bg-amber-600 text-white',
    iconIdleClass: 'bg-amber-100 text-amber-700',
  },
  SUPPLY: {
    icon: PackageOpen,
    selectedClass: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100 shadow-sm',
    idleClass: 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/60',
    iconSelectedClass: 'bg-emerald-600 text-white',
    iconIdleClass: 'bg-emerald-100 text-emerald-700',
  },
};

interface ValidationIssue {
  field: string;
  message: string;
}

interface DisplayApiError {
  status?: number;
  message: string;
  errorCode?: string;
  traceId?: string;
  requestId?: string;
  timestamp?: string;
  path?: string;
  method?: string;
  details: ApiErrorDetail[];
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isFieldError(error: unknown): error is FieldError {
  return !!error && typeof error === 'object' && 'message' in error;
}

function collectValidationIssues(
  errors: FieldErrors<RescueRequestFormValues>,
  parentPath = '',
): ValidationIssue[] {
  return Object.entries(errors).flatMap(([key, value]) => {
    if (!value) return [];

    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    if (Array.isArray(value)) {
      return value.flatMap((entry, index) =>
        collectValidationIssues(
          (entry ?? {}) as FieldErrors<RescueRequestFormValues>,
          `${currentPath}[${index}]`,
        ),
      );
    }

    if (isFieldError(value)) {
      return [
        {
          field: currentPath,
          message:
            typeof value.message === 'string' && value.message
              ? value.message
              : 'Invalid value',
        },
      ];
    }

    if (typeof value === 'object') {
      return collectValidationIssues(
        value as FieldErrors<RescueRequestFormValues>,
        currentPath,
      );
    }

    return [];
  });
}

function getFieldLabel(path: string): string {
  const rootKey = path.split('.')[0]?.replace(/\[\d+\]/g, '') ?? path;
  return FIELD_LABELS[rootKey] ?? rootKey;
}

function getErrorCodeDescription(status?: number, errorCode?: string): string {
  switch (errorCode) {
    case 'BAD_REQUEST':
      return 'คำขอมีรูปแบบไม่ถูกต้อง หรือข้อมูลบางส่วนแปลงค่าไม่ได้';
    case 'FORBIDDEN':
      return 'ข้อมูลยืนยันตัวตนไม่ถูกต้อง หรือไม่มีสิทธิ์เข้าถึงรายการนี้';
    case 'NOT_FOUND':
      return 'ไม่พบข้อมูลที่ต้องการในระบบ';
    case 'CONFLICT':
      return 'ข้อมูลขัดแย้งกับสถานะปัจจุบัน หรือมีการส่งซ้ำ';
    case 'VALIDATION_ERROR':
      return 'ข้อมูลที่กรอกไม่ผ่านเงื่อนไข กรุณาตรวจสอบรายละเอียด';
    case 'INTERNAL_ERROR':
      return 'ระบบปลายทางเกิดข้อผิดพลาดที่ไม่คาดคิด';
    default:
      if (status === 400) return 'คำขอมีรูปแบบไม่ถูกต้อง';
      if (status === 403) return 'ไม่มีสิทธิ์ดำเนินการ';
      if (status === 404) return 'ไม่พบข้อมูล';
      if (status === 409) return 'ข้อมูลขัดแย้งหรือส่งซ้ำ';
      if (status === 422) return 'ข้อมูลไม่ผ่านการตรวจสอบ';
      if (status === 500) return 'ระบบเกิดข้อผิดพลาด';
      return 'ไม่สามารถดำเนินการได้ในขณะนี้';
  }
}

function normalizeErrorDetails(details: ApiError['details']): ApiErrorDetail[] {
  if (Array.isArray(details)) {
    return details;
  }

  if (details && typeof details === 'object') {
    return Object.entries(details).flatMap(([field, issues]) => {
      if (!Array.isArray(issues)) return [{ field, issue: String(issues) }];
      return issues.map((issue) => ({ field, issue }));
    });
  }

  return [];
}

function toDisplayApiError(err: unknown): DisplayApiError {
  if (err instanceof ApiRequestError) {
    const errorCode = err.error.errorCode ?? err.error.code;

    return {
      status: err.status,
      message: err.error.message || `HTTP ${err.status}`,
      errorCode,
      traceId: err.error.traceId ?? err.traceId,
      requestId: err.error.requestId,
      timestamp: err.error.timestamp,
      path: err.error.path,
      method: err.error.method,
      details: normalizeErrorDetails(err.error.details),
    };
  }

  return {
    message:
      (err as { message?: string })?.message ??
      'ไม่สามารถส่งคำขอได้ กรุณาลองใหม่อีกครั้ง',
    details: [],
  };
}

function isTransactionConflict(err: unknown): boolean {
  if (err instanceof ApiRequestError) {
    const msg =
      `${err.error?.message ?? ''} ${err.error?.code ?? ''} ${err.error?.errorCode ?? ''}`.toLowerCase();
    return err.status === 409 || msg.includes('transaction conflict') || msg.includes('transactionconflict');
  }

  const fallbackMessage = String((err as { message?: string })?.message ?? '').toLowerCase();
  return fallbackMessage.includes('transaction conflict') || fallbackMessage.includes('transactionconflict');
}

interface RescueRequestFormProps {
  initialRequestType?: SupportedRequestType;
  onSuccess: (data: {
    requestId: string;
    trackingCode: string;
    status: string;
    submittedAt: string;
  }) => void;
}

export function RescueRequestForm({ initialRequestType, onSuccess }: RescueRequestFormProps) {
  const [apiError, setApiError] = useState<DisplayApiError | null>(null);
  const [isApiErrorModalOpen, setIsApiErrorModalOpen] = useState(false);
  const [isMockingLocation, setIsMockingLocation] = useState(false);
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false);
  const [incidentSearch, setIncidentSearch] = useState('');
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<RescueRequestFormValues | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const submitLockRef = useRef(false);
  const {
    incidents,
    isLoading: isLoadingIncidents,
    isError: isIncidentsError,
  } = useIncidents();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setFocus,
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

  const filteredIncidents = useMemo(() => {
    const query = incidentSearch.trim().toLowerCase();
    if (!query) return incidents;

    return incidents.filter((incident) =>
      `${incident.description} ${incident.label}`.toLowerCase().includes(query),
    );
  }, [incidentSearch, incidents]);

  const mockGpsLocation = () => {
    setIsMockingLocation(true);

    const lat = Number((5.6 + Math.random() * 14.1).toFixed(6));
    const lng = Number((97.3 + Math.random() * 8.2).toFixed(6));

    setValue('latitude', lat, { shouldDirty: true, shouldValidate: true });
    setValue('longitude', lng, { shouldDirty: true, shouldValidate: true });

    window.setTimeout(() => setIsMockingLocation(false), 500);
  };

  const submitRequest = async (data: RescueRequestFormValues) => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setIsConfirmSubmitting(true);
    setIsValidationModalOpen(false);
    setValidationIssues([]);
    setApiError(null);
    setIsApiErrorModalOpen(false);

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
      setApiError(toDisplayApiError(err));
      setIsApiErrorModalOpen(true);
      setIsReviewModalOpen(false);
    } finally {
      submitLockRef.current = false;
      setIsConfirmSubmitting(false);
    }
  };

  const onSubmit = (data: RescueRequestFormValues) => {
    setPendingSubmission(data);
    setIsReviewModalOpen(true);
  };

  const selectedReviewIncident = pendingSubmission
    ? incidents.find((incident) => incident.value === pendingSubmission.incidentId)
    : undefined;
  const selectedReviewRequestType = pendingSubmission
    ? REQUEST_TYPE_OPTIONS.find((option) => option.value === pendingSubmission.requestType)
    : undefined;
  const reviewSpecialNeeds = parseSpecialNeeds(pendingSubmission?.specialNeeds);

  const onInvalid = (formErrors: FieldErrors<RescueRequestFormValues>) => {
    const issues = collectValidationIssues(formErrors);
    const dedupedIssues = Array.from(
      new Map(issues.map((issue) => [issue.field, issue])).values(),
    );

    setValidationIssues(dedupedIssues);
    setIsValidationModalOpen(true);

    const firstErrorField = dedupedIssues[0]?.field?.split('.')[0]?.replace(/\[\d+\]/g, '');
    if (firstErrorField) {
      setFocus(firstErrorField as keyof RescueRequestFormValues);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-8">
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
            render={({ field }) => {
              const selectedIncident = incidents.find((incident) => incident.value === field.value);
              const canOpenIncidentDialog =
                !isLoadingIncidents && !isIncidentsError && incidents.length > 0 && !isSubmitting;

              return (
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-gray-800">
                      เหตุการณ์ภัยพิบัติ <span className="text-red-500">*</span>
                    </label>
                    {isLoadingIncidents && (
                      <span className="text-xs font-medium text-blue-600">กำลังโหลด...</span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!canOpenIncidentDialog}
                    onClick={() => setIsIncidentDialogOpen(true)}
                    className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all ${
                      selectedIncident
                        ? 'border-blue-300 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          selectedIncident ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {selectedIncident ? <CheckCircle2 size={21} /> : <MapPin size={21} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-gray-900">
                          {selectedIncident ? 'เลือกเหตุการณ์แล้ว' : 'กดเพื่อเลือกเหตุการณ์ภัยพิบัติ'}
                        </span>
                        <span className="mt-1 block whitespace-normal break-words text-sm leading-6 text-gray-600">
                          {selectedIncident?.description ??
                            (isLoadingIncidents
                              ? 'กำลังโหลดรายการเหตุการณ์...'
                              : 'เลือกจากรายการเหตุการณ์ที่ระบบเปิดให้แจ้งคำขอ')}
                        </span>
                      </span>
                    </span>
                    <ChevronDown size={20} className="shrink-0 text-gray-400" />
                  </button>

                  {isIncidentsError && (
                    <p className="text-xs font-medium text-red-600">
                      ไม่สามารถโหลดรายการเหตุการณ์ได้ กรุณาลองใหม่อีกครั้ง
                    </p>
                  )}
                  {!isLoadingIncidents && !isIncidentsError && incidents.length === 0 && (
                    <p className="text-xs font-medium text-amber-700">
                      ยังไม่มีรายการเหตุการณ์ให้เลือก
                    </p>
                  )}
                  {errors.incidentId?.message && (
                    <p className="text-xs font-medium text-red-600">{errors.incidentId.message}</p>
                  )}

                  <Dialog
                    isOpen={isIncidentDialogOpen}
                    onClose={() => setIsIncidentDialogOpen(false)}
                    size="xl"
                    title="เลือกเหตุการณ์ภัยพิบัติ"
                    description="เลือกรายการเหตุการณ์ที่ตรงกับพื้นที่หรือสถานการณ์ของคุณ"
                  >
                    <div className="space-y-4">
                      <div className="relative">
                        <Search
                          size={18}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          value={incidentSearch}
                          onChange={(event) => setIncidentSearch(event.target.value)}
                          placeholder="ค้นหาจากรายละเอียดเหตุการณ์..."
                          className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                        {filteredIncidents.map((incident) => {
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
                              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                                selected
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                                  : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50'
                              }`}
                            >
                              <span
                                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                                  selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {selected ? <CheckCircle2 size={20} /> : <MapPin size={20} />}
                              </span>
                              <span className="min-w-0">
                                <span className="block whitespace-normal break-words text-sm font-semibold leading-6 text-gray-900">
                                  {incident.description}
                                </span>
                                {selected && (
                                  <span className="mt-2 inline-flex rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                                    กำลังเลือกอยู่
                                  </span>
                                )}
                              </span>
                            </button>
                          );
                        })}

                        {filteredIncidents.length === 0 && (
                          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                            <p className="text-sm font-bold text-gray-800">ไม่พบเหตุการณ์ที่ค้นหา</p>
                            <p className="mt-1 text-sm text-gray-500">
                              ลองใช้คำค้นอื่น หรือเลือกจากรายการทั้งหมด
                            </p>
                          </div>
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
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-gray-800">
                  ประเภทความช่วยเหลือที่ต้องการ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {REQUEST_TYPE_OPTIONS.map((option) => {
                    const selected = field.value === option.value;
                    const ui = REQUEST_TYPE_UI[option.value];
                    const Icon = ui.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => field.onChange(option.value)}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          selected ? ui.selectedClass : ui.idleClass
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                              selected ? ui.iconSelectedClass : ui.iconIdleClass
                            }`}
                          >
                            <Icon size={24} />
                          </span>
                          {selected && (
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-gray-800 shadow-sm">
                              เลือกอยู่
                            </span>
                          )}
                        </span>
                        <span className="mt-4 block text-xs font-bold uppercase tracking-wide text-gray-500">
                          {option.value}
                        </span>
                        <span className="mt-1 block text-sm font-black leading-6 text-gray-950">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.requestType?.message && (
                  <p className="text-xs font-medium text-red-600">{errors.requestType.message}</p>
                )}
              </div>
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
            placeholder="เช่น พรทิพย์ สุขใจ"
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
          loading={isSubmitting || isConfirmSubmitting}
          disabled={isSubmitting || isConfirmSubmitting}
        >
          {isSubmitting || isConfirmSubmitting
            ? 'กำลังส่งคำขอ...'
            : 'ตรวจสอบก่อนส่งคำขอ'}
        </Button>
      </div>
      </form>

      <Dialog
        isOpen={isReviewModalOpen}
        onClose={() => {
          if (isConfirmSubmitting) return;
          setIsReviewModalOpen(false);
        }}
        size="lg"
        title="ตรวจสอบข้อมูลก่อนส่ง"
        description="กรุณาตรวจสอบรายละเอียดคำขอให้ถูกต้อง ก่อนยืนยันส่งเข้าระบบ"
      >
        {pendingSubmission && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                เหตุการณ์ภัยพิบัติ
              </p>
              <p className="mt-1 whitespace-normal break-words text-sm font-semibold leading-6 text-blue-950">
                {selectedReviewIncident?.description ?? pendingSubmission.incidentId}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-500">ประเภทความช่วยเหลือ</p>
                <p className="mt-1 text-sm font-bold text-gray-950">
                  {selectedReviewRequestType?.label ?? pendingSubmission.requestType}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-500">จำนวนผู้ประสบภัย</p>
                <p className="mt-1 text-sm font-bold text-gray-950">
                  {pendingSubmission.peopleCount.toLocaleString('th-TH')} คน
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-500">ผู้ติดต่อ</p>
                <p className="mt-1 text-sm font-bold text-gray-950">
                  {pendingSubmission.contactName}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-500">เบอร์โทรศัพท์</p>
                <p className="mt-1 text-sm font-bold text-gray-950">
                  {pendingSubmission.contactPhone}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-bold text-gray-500">รายละเอียดสถานการณ์</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-900">
                {pendingSubmission.description}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-bold text-gray-500">ตำแหน่งและที่อยู่</p>
              <div className="mt-2 space-y-1 text-sm leading-6 text-gray-900">
                <p>
                  พิกัด: {pendingSubmission.latitude}, {pendingSubmission.longitude}
                </p>
                {pendingSubmission.locationDetails && (
                  <p>จุดสังเกต: {pendingSubmission.locationDetails}</p>
                )}
                <p className="break-words">
                  {[pendingSubmission.addressLine, pendingSubmission.subdistrict, pendingSubmission.district, pendingSubmission.province]
                    .filter(Boolean)
                    .join(' ')}
                </p>
              </div>
            </div>

            {pendingSubmission.specialNeeds && (
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-500">ความต้องการพิเศษ</p>
                {reviewSpecialNeeds.mode === 'chip' && reviewSpecialNeeds.items?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {reviewSpecialNeeds.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-900">
                    {reviewSpecialNeeds.text || pendingSubmission.specialNeeds}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isConfirmSubmitting}
                onClick={() => setIsReviewModalOpen(false)}
                className="w-full sm:w-auto"
              >
                กลับไปแก้ไข
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={isConfirmSubmitting}
                disabled={isConfirmSubmitting}
                onClick={() => void submitRequest(pendingSubmission)}
                className="w-full sm:w-auto"
              >
                ยืนยันส่งคำขอ
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={isApiErrorModalOpen}
        onClose={() => setIsApiErrorModalOpen(false)}
        size="lg"
        title="ส่งคำขอไม่สำเร็จ"
        description="ระบบปลายทางแจ้งข้อผิดพลาด กรุณาตรวจสอบรายละเอียดด้านล่าง"
      >
        {apiError && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white">
                  <FileWarning size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {apiError.status && (
                      <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-black text-white">
                        HTTP {apiError.status}
                      </span>
                    )}
                    {apiError.errorCode && (
                      <span className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-xs font-black text-red-700">
                        {apiError.errorCode}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 whitespace-normal break-words text-base font-black text-red-950">
                    {apiError.message}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {getErrorCodeDescription(apiError.status, apiError.errorCode)}
                  </p>
                </div>
              </div>
            </div>

            {apiError.details.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-black text-amber-950">รายละเอียดที่ต้องแก้ไข</p>
                <div className="mt-3 space-y-2">
                  {apiError.details.map((detail, index) => (
                    <div
                      key={`${String(detail.field ?? 'detail')}-${index}`}
                      className="rounded-xl border border-amber-200 bg-white px-3 py-2"
                    >
                      <p className="text-xs font-bold text-amber-700">
                        {detail.field ? getFieldLabel(String(detail.field)) : `รายการที่ ${index + 1}`}
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold leading-6 text-gray-900">
                        {detail.issue
                          ? String(detail.issue)
                          : JSON.stringify(detail)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-500">Path / Method</p>
                <p className="mt-1 break-words text-sm font-semibold text-gray-950">
                  {apiError.method ?? '-'} {apiError.path ?? '-'}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="flex items-center gap-1 text-xs font-bold text-gray-500">
                  <Clock size={13} />
                  Timestamp
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-gray-950">
                  {apiError.timestamp ?? '-'}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-500">Trace ID</p>
                <p className="mt-1 break-all text-sm font-semibold text-gray-950">
                  {apiError.traceId ?? '-'}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-500">Request ID</p>
                <p className="mt-1 break-all text-sm font-semibold text-gray-950">
                  {apiError.requestId ?? '-'}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsApiErrorModalOpen(false);
                  setIsReviewModalOpen(true);
                }}
                className="w-full sm:w-auto"
              >
                กลับไปตรวจสอบรายการ
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsApiErrorModalOpen(false)}
                className="w-full sm:w-auto"
              >
                แก้ไขข้อมูลในฟอร์ม
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        size="md"
        title="กรุณาตรวจสอบข้อมูล"
        description="ยังมีข้อมูลบางส่วนที่ต้องกรอกหรือแก้ไขก่อนส่งคำขอ"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white">
              <AlertCircle size={20} />
            </span>
            <div>
              <p className="font-bold">
                พบข้อมูลที่ต้องแก้ไข {validationIssues.length || 1} รายการ
              </p>
              <p className="mt-1 leading-6 text-red-700">
                กรุณาตรวจสอบรายการด้านล่าง แล้วกลับไปกรอกข้อมูลให้ครบถ้วน
              </p>
            </div>
          </div>

          <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {validationIssues.length > 0 ? (
              validationIssues.map((issue) => (
                <div
                  key={issue.field}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                >
                  <p className="text-sm font-bold text-gray-950">{getFieldLabel(issue.field)}</p>
                  <p className="mt-1 text-sm leading-6 text-red-600">{issue.message}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-sm text-gray-700">
                  มีช่องข้อมูลที่ยังไม่ครบถ้วนหรือรูปแบบไม่ถูกต้อง
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="primary" onClick={() => setIsValidationModalOpen(false)}>
              กลับไปแก้ไขข้อมูล
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
