'use client';

import type React from 'react';
import { Clock, FileText, Shield, Star, Truck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrentStateSnapshot, PriorityLevel } from '@/types/rescue';
import { formatPriorityLevel } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';

const PRIORITY_VARIANT_MAP: Record<PriorityLevel, 'gray' | 'blue' | 'amber' | 'red'> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'amber',
  CRITICAL: 'red',
};

interface CurrentStateCardProps {
  state: CurrentStateSnapshot;
}

function InfoBlock({
  icon,
  label,
  children,
  className = '',
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-black text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-bold leading-6 text-slate-950">{children}</div>
    </div>
  );
}

export function CurrentStateCard({ state }: CurrentStateCardProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-blue-200 bg-blue-50">
      <div className="h-3 w-full bg-blue-500" />
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-blue-700">Current state</p>
            <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">
              สถานะคำขอปัจจุบัน
            </h2>
          </div>
          <StatusBadge status={state.status} size="md" dot />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoBlock label="สถานะ">
            <StatusBadge status={state.status} size="md" dot />
          </InfoBlock>
          <InfoBlock label="รอบการประเมิน">
            <span className="rounded-xl bg-slate-100 px-3 py-1.5 font-mono">v{state.stateVersion}</span>
          </InfoBlock>

          {state.priorityLevel && (
            <InfoBlock icon={<Shield size={14} />} label="ระดับความเร่งด่วน">
              <Badge variant={PRIORITY_VARIANT_MAP[state.priorityLevel]} size="sm">
                {formatPriorityLevel(state.priorityLevel)}
              </Badge>
            </InfoBlock>
          )}
          {state.priorityScore !== undefined && (
            <InfoBlock icon={<Star size={14} />} label="คะแนนความเร่งด่วน">
              {String(state.priorityScore)}
            </InfoBlock>
          )}

          {state.assignedUnitId && (
            <InfoBlock icon={<Truck size={14} />} label="ทีมปฏิบัติการที่รับผิดชอบ" className="sm:col-span-2">
              {state.assignedUnitId}
              {state.assignedAt && (
                <span className="mt-1 block text-xs text-slate-500">
                  มอบหมายเมื่อ {formatDateTime(state.assignedAt)}
                </span>
              )}
            </InfoBlock>
          )}

          {state.latestNote && (
            <InfoBlock icon={<FileText size={14} />} label="บันทึกหมายเหตุล่าสุด" className="sm:col-span-2">
              {state.latestNote}
            </InfoBlock>
          )}

          {state.lastUpdatedBy && (
            <InfoBlock icon={<User size={14} />} label="ผู้ทำรายการล่าสุด">
              {state.lastUpdatedBy}
            </InfoBlock>
          )}
          <InfoBlock icon={<Clock size={14} />} label="ระบบอัปเดตล่าสุด">
            {formatDateTime(state.lastUpdatedAt)}
          </InfoBlock>
        </div>
      </div>
    </section>
  );
}
