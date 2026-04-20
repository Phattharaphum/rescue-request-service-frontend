// src/components/staff/state-action-panel.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { CheckCircle2, XCircle, UserCheck, PlayCircle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { ErrorAlert } from '@/components/shared/error-alert';
import { useToast } from '@/components/ui/toast';
import { getAvailableActions, StateAction } from '@/lib/utils/state-machine';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import {
  triageRequest,
  assignRequest,
  startRequest,
  resolveRequest,
  cancelRequest,
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
  triage: 'ประเมิน/คัดกรอง',
  assign: 'มอบหมายทีมปฏิบัติการ',
  start: 'เริ่มปฏิบัติการ',
  resolve: 'ดำเนินการสำเร็จ/ปิดงาน',
  cancel: 'ยกเลิกคำขอ',
};

const ACTION_VARIANT: Record<string, 'primary' | 'secondary' | 'danger' | 'outline'> = {
  triage: 'outline',
  assign: 'primary',
  start: 'primary',
  resolve: 'primary',
  cancel: 'danger',
};

const PRIORITY_OPTIONS: Array<{ value: PriorityLevel; label: string }> = [
  { value: 'LOW', label: 'ต่ำ (Low)' },
  { value: 'MEDIUM', label: 'ปานกลาง (Medium)' },
  { value: 'HIGH', label: 'สูง (High)' },
  { value: 'CRITICAL', label: 'วิกฤต (Critical)' },
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
    throw new Error('ช่อง "ข้อมูลเพิ่มเติม (Meta)" ต้องเป็นรูปแบบ JSON Object ที่ถูกต้องเท่านั้น เช่น {"vehicleType":"BOAT"}');
  }

  return parsed as Record<string, unknown>;
}

function resetValues() {
  return {
    changedBy: 'เจ้าหน้าที่ศูนย์', // Default in Thai
    changedByRole: 'Dispatcher',
    responderUnitId: '',
    reason: '',
    priorityScore: '',
    priorityLevel: '' as const,
    note: '',
    meta: '',
  };
}

export function StateActionPanel({ requestId, status, stateVersion, onSuccess }: StateActionPanelProps) {
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
            { reason: data.reason?.trim() || '', changedBy: base.changedBy, changedByRole: base.changedByRole, meta: base.meta },
            key,
            ifMatch,
          );
        default:
          throw new Error('ไม่พบประเภทการดำเนินการที่ระบุ');
      }
    },
    onSuccess: async (result) => {
      toast.show(`อัปเดตสถานะสำเร็จ (แดชบอร์ด > ${requestId})`, 'success');
      queryClient.invalidateQueries({ queryKey: ['request-detail', requestId] });
      setActiveAction(null);
      reset(resetValues());
      const expectedVersion = (result as { version?: number } | undefined)?.version;
      await onSuccess?.({ expectedVersion });
    },
    onError: (err: unknown) => {
      const e = err as { status?: number; message?: string };
      if (e?.status === 409) {
        setApiError('ข้อมูลถูกอัปเดตโดยเจ้าหน้าที่ท่านอื่นไปแล้ว กรุณารีเฟรชหน้าและลองใหม่อีกครั้ง');
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

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader title="อัปเดตสถานะการปฏิบัติงาน" />
        <CardContent>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            {actions.map((action) => (
              <Button
                key={action.action}
                variant={ACTION_VARIANT[action.action] ?? 'outline'}
                size="md"
                className="flex-1 sm:flex-none justify-start sm:justify-center rounded-xl shadow-sm"
                leftIcon={ACTION_ICONS[action.action]}
                onClick={() => {
                  setApiError(null);
                  setActiveAction(action);
                }}
                disabled={mutation.isPending}
              >
                {ACTION_LABELS[action.action] ?? action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

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
              label="รหัสทีม/หน่วยปฏิบัติการที่รับผิดชอบ"
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
              placeholder="เช่น เป็นการแจ้งเหตุซ้ำ, ผู้ประสบภัยปลอดภัยแล้ว..."
              {...register('reason', { required: 'กรุณาระบุเหตุผลที่ยกเลิก' })}
              error={errors.reason?.message}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <Input
              label="รหัสเจ้าหน้าที่ทำรายการ (ID)"
              placeholder="เช่น staff-101"
              {...register('changedBy')}
            />
            <Input
              label="บทบาท/ตำแหน่ง (Role)"
              placeholder="เช่น Dispatcher, Field Unit"
              {...register('changedByRole')}
            />
          </div>

          {activeAction?.action !== 'cancel' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="ปรับระดับความเร่งด่วน"
                  options={PRIORITY_OPTIONS}
                  placeholder="(เลือกเพื่อเปลี่ยนระดับ)"
                  {...register('priorityLevel')}
                />
                <Input
                  label="คะแนนประเมินความเสี่ยง"
                  type="number"
                  step="0.1"
                  placeholder="เช่น 85.5 (ไม่บังคับ)"
                  {...register('priorityScore')}
                />
              </div>

              <Textarea
                label="บันทึกการปฏิบัติงาน (Note)"
                rows={3}
                placeholder="อธิบายรายละเอียดการปฏิบัติงาน การตัดสินใจ หรือสถานการณ์หน้างาน..."
                {...register('note')}
              />
            </>
          )}

          <Textarea
            label="ข้อมูลเพิ่มเติมทางเทคนิค (JSON Meta)"
            rows={3}
            placeholder='{"vehicleType":"BOAT","dispatchZone":"BKK-01"}'
            helperText="ไม่บังคับใช้ ต้องกรอกในรูปแบบ JSON Object ที่ถูกต้องเท่านั้น"
            className="font-mono text-sm"
            {...register('meta')}
          />

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 rounded-xl bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              onClick={closeDialog}
              disabled={mutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant={activeAction?.action === 'cancel' ? 'danger' : 'primary'}
              size="lg"
              className="flex-1 rounded-xl shadow-sm"
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
