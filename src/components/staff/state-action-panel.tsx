'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { CheckCircle, XCircle, UserCheck, PlayCircle, ClipboardList } from 'lucide-react';
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
  triage: <ClipboardList size={16} />,
  assign: <UserCheck size={16} />,
  start: <PlayCircle size={16} />,
  resolve: <CheckCircle size={16} />,
  cancel: <XCircle size={16} />,
};

const ACTION_VARIANT: Record<string, 'primary' | 'secondary' | 'danger' | 'outline'> = {
  triage: 'secondary',
  assign: 'primary',
  start: 'primary',
  resolve: 'primary',
  cancel: 'danger',
};

const PRIORITY_OPTIONS: Array<{ value: PriorityLevel; label: string }> = [
  { value: 'LOW', label: 'LOW' },
  { value: 'MEDIUM', label: 'MEDIUM' },
  { value: 'HIGH', label: 'HIGH' },
  { value: 'CRITICAL', label: 'CRITICAL' },
];

interface StateActionPanelProps {
  requestId: string;
  status: RequestStatus;
  stateVersion: number;
  onSuccess?: () => void;
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
    throw new Error('meta must be a JSON object. Example: {"dispatchZone":"BKK-01"}');
  }

  return parsed as Record<string, unknown>;
}

function resetValues() {
  return {
    changedBy: 'staff',
    changedByRole: 'staff',
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
        throw new Error('priorityScore must be numeric');
      }

      const base = {
        changedBy: data.changedBy.trim() || 'staff',
        changedByRole: data.changedByRole.trim() || 'staff',
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
            {
              ...base,
              responderUnitId: data.responderUnitId?.trim() || '',
            },
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
          throw new Error('Unknown action');
      }
    },
    onSuccess: () => {
      toast.show('ดำเนินการสำเร็จ', 'success');
      queryClient.invalidateQueries({ queryKey: ['request-detail', requestId] });
      setActiveAction(null);
      reset(resetValues());
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const e = err as { status?: number; message?: string };
      if (e?.status === 409) {
        setApiError('ข้อมูลถูกอัปเดตโดยผู้อื่น กรุณารีเฟรชหน้าและลองใหม่');
      } else if (e?.status === 422) {
        setApiError(e.message ?? 'ข้อมูลไม่ถูกต้องตามเงื่อนไข API');
      } else {
        setApiError(e?.message ?? 'เกิดข้อผิดพลาด');
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
      <Card>
        <CardHeader title="ดำเนินการ" />
        <CardContent>
          {apiError && (
            <div className="mb-4">
              <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action.action}
                variant={ACTION_VARIANT[action.action] ?? 'outline'}
                size="sm"
                leftIcon={ACTION_ICONS[action.action]}
                onClick={() => {
                  setApiError(null);
                  setActiveAction(action);
                }}
                disabled={mutation.isPending}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        isOpen={!!activeAction}
        onClose={closeDialog}
        title={`ยืนยัน: ${activeAction?.label ?? ''}`}
        size="sm"
      >
        <form
          onSubmit={handleSubmit((formData) => mutation.mutate(formData))}
          noValidate
          className="space-y-4"
        >
          <p className="text-sm text-gray-500">
            ยืนยันการดำเนินการ &ldquo;{activeAction?.label}&rdquo;
          </p>

          {apiError && <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />}

          {activeAction?.requiresField === 'responderUnitId' && (
            <Input
              label="responderUnitId"
              required
              placeholder="UNIT-001"
              {...register('responderUnitId', { required: 'กรุณาระบุ responderUnitId' })}
              error={errors.responderUnitId?.message}
            />
          )}

          {activeAction?.requiresField === 'reason' && (
            <Input
              label="reason"
              required
              placeholder="Cancellation reason"
              {...register('reason', { required: 'กรุณาระบุ reason' })}
              error={errors.reason?.message}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="changedBy"
              placeholder="staff-001"
              {...register('changedBy')}
            />
            <Input
              label="changedByRole"
              placeholder="dispatcher"
              {...register('changedByRole')}
            />
          </div>

          {activeAction?.action !== 'cancel' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="priorityScore"
                  type="number"
                  step="0.1"
                  placeholder="85.5"
                  {...register('priorityScore')}
                />
                <Select
                  label="priorityLevel"
                  options={PRIORITY_OPTIONS}
                  placeholder="(optional)"
                  {...register('priorityLevel')}
                />
              </div>

              <Textarea
                label="note"
                rows={3}
                placeholder="Operational note"
                {...register('note')}
              />
            </>
          )}

          <Textarea
            label="meta (JSON object)"
            rows={4}
            placeholder='{"vehicleType":"BOAT","dispatchZone":"BKK-01"}'
            helperText="Optional. Must be a JSON object."
            {...register('meta')}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={closeDialog}
              disabled={mutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant={activeAction?.action === 'cancel' ? 'danger' : 'primary'}
              className="flex-1"
              loading={mutation.isPending}
            >
              {activeAction?.label ?? 'ยืนยัน'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
