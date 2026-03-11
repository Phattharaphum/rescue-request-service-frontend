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
    <Card>
      <CardHeader title="สถานะปัจจุบัน" />
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoItem
            icon={<Hash size={14} />}
            label="รหัสคำขอ"
            value={<span className="font-mono text-xs">{state.requestId}</span>}
          />
          <InfoItem
            icon={<Tag size={14} />}
            label="เหตุการณ์"
            value={state.incidentId}
          />
          <InfoItem
            label="เวอร์ชันสถานะ"
            value={`v${state.stateVersion}`}
          />
          <InfoItem
            label="สถานะ"
            value={<StatusBadge status={state.status} size="sm" dot />}
          />
          {state.priorityLevel && (
            <InfoItem
              icon={<Shield size={14} />}
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
              icon={<Star size={14} />}
              label="คะแนนความเร่งด่วน"
              value={String(state.priorityScore)}
            />
          )}
          {state.assignedUnitId && (
            <InfoItem
              icon={<Truck size={14} />}
              label="หน่วยงานที่รับผิดชอบ"
              value={state.assignedUnitId}
            />
          )}
          {state.assignedAt && (
            <InfoItem
              icon={<Clock size={14} />}
              label="มอบหมายเมื่อ"
              value={formatDateTime(state.assignedAt)}
            />
          )}
          {state.latestNote && (
            <div className="sm:col-span-2">
              <InfoItem
                icon={<FileText size={14} />}
                label="หมายเหตุล่าสุด"
                value={state.latestNote}
              />
            </div>
          )}
          {state.lastUpdatedBy && (
            <InfoItem
              icon={<User size={14} />}
              label="อัปเดตโดย"
              value={state.lastUpdatedBy}
            />
          )}
          <InfoItem
            icon={<Clock size={14} />}
            label="อัปเดตล่าสุด"
            value={formatDateTime(state.lastUpdatedAt)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
