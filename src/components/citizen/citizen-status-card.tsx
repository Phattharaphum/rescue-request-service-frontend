// src/components/citizen/citizen-status-card.tsx
'use client';

import {
  User,
  Phone,
  Users,
  Clock,
  Truck,
  FileText,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { InfoItem } from '@/components/shared/info-item';
import { LocationSummary } from '@/components/citizen/location-summary';
import { CitizenStatusResponse } from '@/types/rescue';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date';
import { formatRequestType, formatPriorityLevel } from '@/lib/utils/format';
import { parseSpecialNeeds } from '@/lib/utils/special-needs';

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
  const parsedSpecialNeeds = parseSpecialNeeds(data.specialNeeds);
  const specialNeedChips =
    parsedSpecialNeeds.mode === 'chip'
      ? (parsedSpecialNeeds.items ?? [])
      : parsedSpecialNeeds.text
        ? [parsedSpecialNeeds.text]
        : [];

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card className="border-blue-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-blue-600 h-2 w-full"></div>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-4">
            <StatusBadge status={data.status} size="md" dot />
            <p className="text-lg text-gray-900 font-bold">{data.statusMessage}</p>
            {data.nextSuggestedAction && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3.5 max-w-md w-full text-left shadow-sm mt-2">
                <AlertCircle size={20} className="shrink-0 mt-0.5 text-blue-600" />
                <p className="text-sm font-medium text-blue-900 leading-relaxed">{data.nextSuggestedAction}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Request Info */}
      <Card>
        <CardHeader title="รายละเอียดคำขอ" />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
            <InfoItem
              icon={<FileText size={16} className="text-gray-400" />}
              label="รหัสคำขออ้างอิง"
              value={<span className="font-mono text-sm font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{data.requestId}</span>}
            />
            <InfoItem
              label="ประเภทความช่วยเหลือ"
              value={<span className="font-semibold text-gray-900">{formatRequestType(data.requestType)}</span>}
            />
            <div className="sm:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <InfoItem
                label="รายละเอียดสถานการณ์"
                value={data.description}
              />
            </div>
            <InfoItem
              icon={<Users size={16} className="text-gray-400" />}
              label="จำนวนผู้ประสบภัย"
              value={<span className="font-semibold">{data.peopleCount ?? '-'} คน</span>}
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
                  <span className="text-gray-400">รอการประเมิน</span>
                )
              }
            />
            {data.specialNeeds && (
              <div className="sm:col-span-2 pt-2 border-t border-gray-100">
                <InfoItem
                  label="ความต้องการพิเศษ"
                  value={
                    specialNeedChips.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {specialNeedChips.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )
                  }
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <LocationSummary location={data.location} />

      {/* Contact Info & Timestamps (Combined for compact view) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="ข้อมูลผู้ติดต่อ" />
          <CardContent>
            <div className="space-y-4">
              <InfoItem
                icon={<User size={16} className="text-gray-400" />}
                label="ชื่อผู้ติดต่อ"
                value={<span className="font-medium text-gray-900">{data.contactName}</span>}
              />
              <InfoItem
                icon={<Phone size={16} className="text-gray-400" />}
                label="เบอร์โทรศัพท์"
                value={<span className="font-medium font-mono text-gray-900">{data.contactPhoneMasked}</span>}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="ข้อมูลเวลา" />
          <CardContent>
            <div className="space-y-4">
              <InfoItem
                icon={<Clock size={16} className="text-gray-400" />}
                label="ยื่นคำขอเมื่อ"
                value={data.submittedAt ? formatDateTime(data.submittedAt) : '-'}
              />
              <InfoItem
                icon={<Clock size={16} className="text-blue-500" />}
                label="อัปเดตล่าสุดระบบ"
                value={
                  data.lastUpdatedAt ? (
                    <span title={formatDateTime(data.lastUpdatedAt)} className="font-medium text-blue-700">
                      {formatRelativeTime(data.lastUpdatedAt)}
                    </span>
                  ) : (
                    '-'
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Unit */}
      {data.assignedUnitId && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader title="หน่วยงานที่รับผิดชอบ" className="pb-2" />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem
                icon={<Truck size={16} className="text-green-600" />}
                label="ทีมปฏิบัติการ"
                value={<span className="font-bold text-green-800">{data.assignedUnitId}</span>}
              />
              {data.assignedAt && (
                <InfoItem
                  icon={<Clock size={16} className="text-green-600" />}
                  label="มอบหมายงานเมื่อ"
                  value={<span className="text-green-800">{formatDateTime(data.assignedAt)}</span>}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest Note */}
      {data.latestNote && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader title="หมายเหตุล่าสุดจากเจ้าหน้าที่" />
          <CardContent>
            <p className="text-sm font-medium text-amber-900 leading-relaxed">{data.latestNote}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}