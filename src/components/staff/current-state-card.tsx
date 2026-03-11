// src/components/staff/current-state-card.tsx
'use client';

import { Hash, Tag, Shield, Truck, Clock, User, FileText, Star } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { InfoItem } from '@/components/shared/info-item';
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

export function CurrentStateCard({ state }: CurrentStateCardProps) {
  return (
    <Card className="border-blue-100 overflow-hidden shadow-sm">
      <div className="bg-blue-600 h-1.5 w-full"></div>
      <CardHeader title="สถานะคำขอปัจจุบัน (Current State)" className="bg-blue-50/30 pb-4" />
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
          <InfoItem
            label="สถานะ"
            value={<StatusBadge status={state.status} size="md" dot />}
          />
          <InfoItem
            label="รอบการประเมิน (Version)"
            value={<span className="font-mono font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">v{state.stateVersion}</span>}
          />
          
          <div className="sm:col-span-2 h-px bg-gray-100 my-1"></div>

          {state.priorityLevel && (
            <InfoItem
              icon={<Shield size={16} className="text-gray-400" />}
              label="ระดับความเร่งด่วน"
              value={
                <Badge variant={PRIORITY_VARIANT_MAP[state.priorityLevel]} size="sm">
                  {formatPriorityLevel(state.priorityLevel)}
                </Badge>
              }
            />
          )}
          {state.priorityScore !== undefined && (
            <InfoItem
              icon={<Star size={16} className="text-gray-400" />}
              label="คะแนนความเร่งด่วน"
              value={<span className="font-bold text-gray-900">{String(state.priorityScore)}</span>}
            />
          )}
          
          {state.assignedUnitId && (
            <div className="sm:col-span-2 bg-green-50 rounded-xl p-4 border border-green-100 flex flex-col sm:flex-row sm:items-center gap-4">
              <InfoItem
                icon={<Truck size={16} className="text-green-600" />}
                label="ทีมปฏิบัติการที่รับผิดชอบ"
                value={<span className="font-bold text-green-800">{state.assignedUnitId}</span>}
              />
              {state.assignedAt && (
                <div className="hidden sm:block w-px h-8 bg-green-200"></div>
              )}
              {state.assignedAt && (
                <InfoItem
                  icon={<Clock size={16} className="text-green-600" />}
                  label="มอบหมายงานเมื่อ"
                  value={<span className="text-green-800 font-medium">{formatDateTime(state.assignedAt)}</span>}
                />
              )}
            </div>
          )}

          {state.latestNote && (
            <div className="sm:col-span-2 bg-amber-50/50 rounded-xl p-4 border border-amber-100">
              <InfoItem
                icon={<FileText size={16} className="text-amber-500" />}
                label="บันทึกหมายเหตุล่าสุด"
                value={<span className="text-amber-900 font-medium leading-relaxed">{state.latestNote}</span>}
              />
            </div>
          )}

          <div className="sm:col-span-2 h-px bg-gray-100 my-1"></div>

          {state.lastUpdatedBy && (
            <InfoItem
              icon={<User size={16} className="text-gray-400" />}
              label="ผู้ทำรายการล่าสุด"
              value={<span className="font-medium text-gray-900">{state.lastUpdatedBy}</span>}
            />
          )}
          <InfoItem
            icon={<Clock size={16} className="text-gray-400" />}
            label="ระบบอัปเดตล่าสุด"
            value={formatDateTime(state.lastUpdatedAt)}
          />
        </div>
      </CardContent>
    </Card>
  );
}