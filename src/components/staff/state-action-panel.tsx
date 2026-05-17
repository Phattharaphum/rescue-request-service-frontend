'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { CheckCircle2, ClipboardList, PlayCircle, UserCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ErrorAlert } from '@/components/shared/error-alert';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { getAvailableActions, StateAction } from '@/lib/utils/state-machine';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import {
  assignRequest,
  cancelRequest,
  resolveRequest,
  startRequest,
  triageRequest,
} from '@/lib/api/rescue';
import { PriorityLevel, RequestStatus } from '@/types/rescue';

const ACTION_ICONS: Record<string, React.ReactNode> = {
  triage: <ClipboardList size={18} />,
  assign: <UserCheck size={18} />,
  start: <PlayCircle size={18} />,
  resolve: <CheckCircle2 size={18} />,
  cancel: <XCircle size={18} />,
};

const ACTION_LABELS: Record<string, string> = {
  triage: 'ประเมิน / คัดกรอง',
  assign: 'มอบหมายทีมปฏิบัติการ',
  start: 'เริ่มปฏิบัติการ',
  resolve: 'ดำเนินการสำเร็จ / ปิดงาน',
  cancel: 'ยกเลิกคำขอ',
};

const PRIORITY_OPTIONS: Array<{ value: PriorityLevel; label: string }> = [
  { value: 'LOW', label: 'ต่ำ' },
  { value: 'MEDIUM', label: 'ปานกลาง' },
  { value: 'HIGH', label: 'สูง' },
  { value: 'CRITICAL', label: 'วิกฤต' },
];

interface StateActionPanelProps {
  requestId: string;
  status: RequestStatus;
  stateVersion: number;
  onSuccess?: (payload?: { expectedVersion?: number }) => Promise<void> | void;
}

interface ActionFormData {
  changedBy: string;
  changedByRole: string;
  responderUnitId?: string;
  reason?: string;
  priorityScore?: string;
  priorityLevel?: '' | PriorityLevel;
  note?: string;
  meta?: string;
}

function parseMeta(raw?: string): Record<string, unknown> | undefined {
  const text = raw?.trim();
  if (!text) return undefined;

  const parsed = JSON.parse(text);
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('ข้อมูลเพิ่มเติม (Meta) ต้องเป็น JSON Object ที่ถูกต้อง เช่น {"vehicleType":"BOAT"}');
  }

  return parsed as Record<string, unknown>;
}

function resetValues() {
  return {
    changedBy: 'เจ้าหน้าที่ศูนย์',
    changedByRole: 'Dispatcher',
    responderUnitId: '',
    reason: '',
    priorityScore: '',
    priorityLevel: '' as const,
    note: '',
    meta: '',
  };
}

export function StateActionPanel({
  requestId,
  status,
  stateVersion,
  onSuccess,
}: StateActionPanelProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState<StateAction | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const actions = getAvailableActions(status);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActionFormData>({
    defaultValues: resetValues(),
  });

  const mutation = useMutation({
    mutationFn: async (data: ActionFormData) => {
      if (!activeAction) return;

      const key = generateIdempotencyKey();
      const ifMatch = String(stateVersion);
      const priorityScore = data.priorityScore?.trim() ? Number(data.priorityScore) : undefined;

      if (priorityScore !== undefined && Number.isNaN(priorityScore)) {
        throw new Error('คะแนนความเร่งด่วนต้องเป็นตัวเลขเท่านั้น');
      }

      const base = {
        changedBy: data.changedBy.trim() || 'System',
        changedByRole: data.changedByRole.trim() || 'Staff',
        priorityScore,
        priorityLevel: data.priorityLevel || undefined,
        note: data.note?.trim() || undefined,
        meta: parseMeta(data.meta),
      };

      switch (activeAction.action) {
        case 'triage':
          return triageRequest(requestId, base, key, ifMatch);
        case 'assign':
          return assignRequest(
            requestId,
            { ...base, responderUnitId: data.responderUnitId?.trim() || '' },
            key,
            ifMatch,
          );
        case 'start':
          return startRequest(requestId, base, key, ifMatch);
        case 'resolve':
          return resolveRequest(requestId, base, key, ifMatch);
        case 'cancel':
          return cancelRequest(
            requestId,
            {
              reason: data.reason?.trim() || '',
              changedBy: base.changedBy,
              changedByRole: base.changedByRole,
              meta: base.meta,
            },
            key,
            ifMatch,
          );
        default:
          throw new Error('ไม่พบประเภทการดำเนินการที่ระบุ');
      }
    },
    onSuccess: async (result) => {
      toast.show(`อัปเดตสถานะสำเร็จ (${requestId})`, 'success');
      queryClient.invalidateQueries({ queryKey: ['request-detail', requestId] });
      setActiveAction(null);
      reset(resetValues());
      const expectedVersion = (result as { version?: number } | undefined)?.version;
      await onSuccess?.({ expectedVersion });
    },
    onError: (err: unknown) => {
      const e = err as { status?: number; message?: string };
      if (e?.status === 409) {
        setApiError('ข้อมูลถูกอัปเดตโดยเจ้าหน้าที่ท่านอื่นแล้ว กรุณารีเฟรชหน้าและลองใหม่อีกครั้ง');
      } else if (e?.status === 422) {
        setApiError(e.message ?? 'ข้อมูลที่กรอกไม่ถูกต้องตามเงื่อนไข');
      } else {
        setApiError(e?.message ?? 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ');
      }
    },
  });

  const closeDialog = () => {
    setActiveAction(null);
    reset(resetValues());
    setApiError(null);
  };

  if (actions.length === 0) return null;

  return (
    <>
      <section className="rounded-[28px] border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <p className="text-sm font-black text-cyan-700">Actions</p>
          <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">
            อัปเดตสถานะการปฏิบัติงาน
          </h2>
        </div>
        <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
          {actions.map((action) => (
            <button
              key={action.action}
              type="button"
              className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-black transition-colors sm:flex-none ${
                action.action === 'cancel'
                  ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                  : 'border-slate-200 bg-slate-950 text-white hover:bg-slate-800'
              }`}
              onClick={() => {
                setApiError(null);
                setActiveAction(action);
              }}
              disabled={mutation.isPending}
            >
              {ACTION_ICONS[action.action]}
              {ACTION_LABELS[action.action] ?? action.label}
            </button>
          ))}
        </div>
      </section>

      <Dialog
        isOpen={!!activeAction}
        onClose={closeDialog}
        title={`ยืนยัน: ${activeAction ? (ACTION_LABELS[activeAction.action] ?? activeAction.label) : ''}`}
        size="md"
      >
        <form
          onSubmit={handleSubmit((formData) => mutation.mutate(formData))}
          noValidate
          className="space-y-5"
        >
          {apiError && <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />}

          {activeAction?.requiresField === 'responderUnitId' && (
            <Input
              label="รหัสทีม / หน่วยปฏิบัติการที่รับผิดชอบ"
              required
              placeholder="เช่น TEAM-A01"
              {...register('responderUnitId', { required: 'กรุณาระบุรหัสหน่วยปฏิบัติการ' })}
              error={errors.responderUnitId?.message}
            />
          )}

          {activeAction?.requiresField === 'reason' && (
            <Input
              label="เหตุผลที่ยกเลิก"
              required
              placeholder="เช่น แจ้งเหตุซ้ำ หรือผู้ประสบภัยปลอดภัยแล้ว"
              {...register('reason', { required: 'กรุณาระบุเหตุผลที่ยกเลิก' })}
              error={errors.reason?.message}
            />
          )}

          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <Input label="รหัสเจ้าหน้าที่ทำรายการ" placeholder="เช่น staff-101" {...register('changedBy')} />
            <Input label="บทบาท / ตำแหน่ง" placeholder="เช่น Dispatcher, Field Unit" {...register('changedByRole')} />
          </div>

          {activeAction?.action !== 'cancel' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="ปรับระดับความเร่งด่วน"
                  options={PRIORITY_OPTIONS}
                  placeholder="เลือกเพื่อเปลี่ยนระดับ"
                  {...register('priorityLevel')}
                />
                <Input
                  label="คะแนนประเมินความเสี่ยง"
                  type="number"
                  step="0.1"
                  placeholder="เช่น 85.5"
                  {...register('priorityScore')}
                />
              </div>

              <Textarea
                label="บันทึกการปฏิบัติงาน"
                rows={3}
                placeholder="อธิบายรายละเอียดการปฏิบัติงาน การตัดสินใจ หรือสถานการณ์หน้างาน"
                {...register('note')}
              />
            </>
          )}

          <Textarea
            label="ข้อมูลเพิ่มเติมทางเทคนิค (JSON Meta)"
            rows={3}
            placeholder='{"vehicleType":"BOAT","dispatchZone":"BKK-01"}'
            helperText="ไม่บังคับ ต้องเป็น JSON Object ที่ถูกต้อง"
            className="font-mono text-sm"
            {...register('meta')}
          />

          <div className="grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
            <button
              type="button"
              className="flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
              onClick={closeDialog}
              disabled={mutation.isPending}
            >
              ยกเลิก
            </button>
            <Button
              type="submit"
              variant={activeAction?.action === 'cancel' ? 'danger' : 'primary'}
              size="lg"
              className="h-11 rounded-2xl font-black"
              loading={mutation.isPending}
            >
              {activeAction ? (ACTION_LABELS[activeAction.action] ?? 'ยืนยันการทำรายการ') : 'ยืนยัน'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
