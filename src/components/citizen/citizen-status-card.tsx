'use client';

import {
  User,
  Phone,
  Users,
  Clock,
  Truck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { InfoItem } from '@/components/shared/info-item';
import { LocationSummary } from '@/components/citizen/location-summary';
import { CitizenStatusResponse } from '@/types/rescue';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date';
import { formatRequestType, formatPriorityLevel } from '@/lib/utils/format';

const PRIORITY_VARIANT_MAP = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'amber',
  CRITICAL: 'red',
} as const;

interface CitizenStatusCardProps {
  data: CitizenStatusResponse;
}

export function CitizenStatusCard({ data }: CitizenStatusCardProps) {
  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <Card>
        <CardContent>
          <div className="flex flex-col items-center text-center py-4 gap-3">
            <StatusBadge status={data.status} size="md" dot />
            <p className="text-gray-700 font-medium">{data.statusMessage}</p>
            {data.nextSuggestedAction && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 max-w-md w-full text-left">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-blue-500" />
                <p className="text-sm text-blue-700">{data.nextSuggestedAction}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Request Info */}
      <Card>
        <CardHeader title="ข้อมูลคำขอ" />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem
              icon={<FileText size={14} />}
              label="รหัสคำขอ"
              value={<span className="font-mono text-xs">{data.requestId}</span>}
            />
            <InfoItem
              label="ประเภทคำขอ"
              value={formatRequestType(data.requestType)}
            />
            <div className="sm:col-span-2">
              <InfoItem
                label="รายละเอียด"
                value={data.description}
              />
            </div>
            <InfoItem
              icon={<Users size={14} />}
              label="จำนวนผู้ประสบภัย"
              value={`${data.peopleCount ?? '-'} คน`}
            />
            <InfoItem
              label="ระดับความเร่งด่วน"
              value={
                data.priorityLevel ? (
                  <Badge
                    variant={PRIORITY_VARIANT_MAP[data.priorityLevel] ?? 'gray'}
                    size="sm"
                  >
                    {formatPriorityLevel(data.priorityLevel)}
                  </Badge>
                ) : (
                  '-'
                )
              }
            />
            {data.specialNeeds && (
              <div className="sm:col-span-2">
                <InfoItem label="ความต้องการพิเศษ" value={data.specialNeeds} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <LocationSummary location={data.location} />

      {/* Contact Info */}
      <Card>
        <CardHeader title="ข้อมูลผู้ติดต่อ" />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem
              icon={<User size={14} />}
              label="ชื่อผู้ติดต่อ"
              value={data.contactName}
            />
            <InfoItem
              icon={<Phone size={14} />}
              label="เบอร์โทรศัพท์"
              value={data.contactPhoneMasked}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assigned Unit */}
      {data.assignedUnitId && (
        <Card>
          <CardHeader title="หน่วยงานที่รับผิดชอบ" />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem
                icon={<Truck size={14} />}
                label="หน่วยงาน"
                value={data.assignedUnitId}
              />
              {data.assignedAt && (
                <InfoItem
                  icon={<Clock size={14} />}
                  label="มอบหมายเมื่อ"
                  value={formatDateTime(data.assignedAt)}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest Note */}
      {data.latestNote && (
        <Card>
          <CardHeader title="หมายเหตุล่าสุด" />
          <CardContent>
            <p className="text-sm text-gray-700">{data.latestNote}</p>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <CardHeader title="ข้อมูลเวลา" />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem
              icon={<Clock size={14} />}
              label="ยื่นคำขอเมื่อ"
              value={data.submittedAt ? formatDateTime(data.submittedAt) : '-'}
            />
            <InfoItem
              icon={<Clock size={14} />}
              label="อัปเดตล่าสุด"
              value={
                data.lastUpdatedAt ? (
                  <span title={formatDateTime(data.lastUpdatedAt)}>
                    {formatRelativeTime(data.lastUpdatedAt)}
                  </span>
                ) : (
                  '-'
                )
              }
            />
            {data.lastCitizenUpdateAt && (
              <InfoItem
                label="ผู้ประสบภัยอัปเดตล่าสุด"
                value={formatDateTime(data.lastCitizenUpdateAt)}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

