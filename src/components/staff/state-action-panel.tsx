'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { CheckCircle, XCircle, UserCheck, PlayCircle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { RequestStatus } from '@/types/rescue';

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

interface StateActionPanelProps {
  requestId: string;
  status: RequestStatus;
  stateVersion: number;
  onSuccess?: () => void;
}

interface ActionFormData {
  responderUnitId?: string;
  reason?: string;
  note?: string;
}

export function StateActionPanel({ requestId, status, stateVersion, onSuccess }: StateActionPanelProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState<StateAction | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const actions = getAvailableActions(status);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ActionFormData>();

  const mutation = useMutation({
    mutationFn: async (data: ActionFormData) => {
      if (!activeAction) return;
      const key = generateIdempotencyKey();
      const ifMatch = String(stateVersion);
      const base = {
        changedBy: 'staff',
        changedByRole: 'STAFF' as const,
        note: data.note,
      };

      switch (activeAction.action) {
        case 'triage':
          return triageRequest(requestId, base, key, ifMatch);
        case 'assign':
          return assignRequest(
            requestId,
            { ...base, responderUnitId: data.responderUnitId! },
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
            { ...base, changeReason: data.reason, reason: data.reason },
            key,
            ifMatch,
          );
        default:
          throw new Error('Unknown action');
      }
    },
    onSuccess: () => {
      toast.show('ดำเนินการสำเร็จ', 'success');
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      setActiveAction(null);
      reset();
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const e = err as { status?: number; message?: string };
      if (e?.status === 409) {
        setApiError('ข้อมูลถูกอัปเดตโดยผู้อื่น กรุณารีเฟรชหน้าและลองใหม่อีกครั้ง');
      } else {
        setApiError(e?.message ?? 'เกิดข้อผิดพลาด');
      }
    },
  });

  const closeDialog = () => {
    setActiveAction(null);
    reset();
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
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          noValidate
          className="space-y-4"
        >
          <p className="text-sm text-gray-500">
            คุณต้องการ &ldquo;{activeAction?.label}&rdquo; คำขอนี้ใช่หรือไม่?
          </p>

          {apiError && (
            <ErrorAlert message={apiError} onRetry={() => setApiError(null)} />
          )}

          {activeAction?.requiresField === 'responderUnitId' && (
            <Input
              label="รหัสหน่วยงาน"
              required
              placeholder="เช่น UNIT-001"
              {...register('responderUnitId', { required: 'กรุณาระบุหน่วยงาน' })}
              error={errors.responderUnitId?.message}
            />
          )}
          {activeAction?.requiresField === 'reason' && (
            <Input
              label="เหตุผลการยกเลิก"
              required
              placeholder="ระบุเหตุผล..."
              {...register('reason', { required: 'กรุณาระบุเหตุผล' })}
              error={errors.reason?.message}
            />
          )}
          <Input
            label="หมายเหตุ (ถ้ามี)"
            placeholder="หมายเหตุเพิ่มเติม..."
            {...register('note')}
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
