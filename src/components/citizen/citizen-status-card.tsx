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
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { InfoItem } from '@/components/shared/info-item';
import { LocationSummary } from '@/components/citizen/location-summary';
import { CitizenStatusResponse, RequestStatus } from '@/types/rescue';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date';
import { formatRequestType, formatPriorityLevel, formatStatus } from '@/lib/utils/format';
import { parseSpecialNeeds } from '@/lib/utils/special-needs';
import { cn } from '@/lib/utils/cn';

const PRIORITY_VARIANT_MAP = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'amber',
  CRITICAL: 'red',
} as const;

interface StatusPresentation {
  icon: LucideIcon;
  frameClass: string;
  stripeClass: string;
  iconWrapClass: string;
  iconClass: string;
  headlineClass: string;
  messageClass: string;
  suggestionClass: string;
  pulseClass: string;
}

const STATUS_PRESENTATION_MAP: Record<RequestStatus, StatusPresentation> = {
  SUBMITTED: {
    icon: FileText,
    frameClass: 'border-slate-200 bg-gradient-to-br from-slate-50 to-white',
    stripeClass: 'bg-slate-500',
    iconWrapClass: 'bg-slate-100 border border-slate-200',
    iconClass: 'text-slate-700',
    headlineClass: 'text-slate-900',
    messageClass: 'border-slate-200 bg-white text-slate-800',
    suggestionClass: 'border-slate-200 bg-slate-50 text-slate-700',
    pulseClass: 'bg-slate-300/70',
  },
  TRIAGED: {
    icon: AlertCircle,
    frameClass: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white',
    stripeClass: 'bg-amber-500',
    iconWrapClass: 'bg-amber-100 border border-amber-200',
    iconClass: 'text-amber-700',
    headlineClass: 'text-amber-900',
    messageClass: 'border-amber-200 bg-white text-amber-900',
    suggestionClass: 'border-amber-200 bg-amber-50 text-amber-800',
    pulseClass: 'bg-amber-300/70',
  },
  ASSIGNED: {
    icon: Truck,
    frameClass: 'border-sky-200 bg-gradient-to-br from-sky-50 to-white',
    stripeClass: 'bg-sky-500',
    iconWrapClass: 'bg-sky-100 border border-sky-200',
    iconClass: 'text-sky-700',
    headlineClass: 'text-sky-900',
    messageClass: 'border-sky-200 bg-white text-sky-900',
    suggestionClass: 'border-sky-200 bg-sky-50 text-sky-800',
    pulseClass: 'bg-sky-300/70',
  },
  IN_PROGRESS: {
    icon: Clock,
    frameClass: 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-white',
    stripeClass: 'bg-indigo-500',
    iconWrapClass: 'bg-indigo-100 border border-indigo-200',
    iconClass: 'text-indigo-700',
    headlineClass: 'text-indigo-900',
    messageClass: 'border-indigo-200 bg-white text-indigo-900',
    suggestionClass: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    pulseClass: 'bg-indigo-300/70',
  },
  RESOLVED: {
    icon: CheckCircle2,
    frameClass: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white',
    stripeClass: 'bg-emerald-500',
    iconWrapClass: 'bg-emerald-100 border border-emerald-200',
    iconClass: 'text-emerald-700',
    headlineClass: 'text-emerald-900',
    messageClass: 'border-emerald-200 bg-white text-emerald-900',
    suggestionClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    pulseClass: 'bg-emerald-300/70',
  },
  CANCELLED: {
    icon: XCircle,
    frameClass: 'border-rose-200 bg-gradient-to-br from-rose-50 to-white',
    stripeClass: 'bg-rose-500',
    iconWrapClass: 'bg-rose-100 border border-rose-200',
    iconClass: 'text-rose-700',
    headlineClass: 'text-rose-900',
    messageClass: 'border-rose-200 bg-white text-rose-900',
    suggestionClass: 'border-rose-200 bg-rose-50 text-rose-800',
    pulseClass: 'bg-rose-300/70',
  },
};

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
  const statusPresentation = STATUS_PRESENTATION_MAP[data.status];
  const StatusIcon = statusPresentation.icon;
  const isActiveStatus = data.status !== 'RESOLVED' && data.status !== 'CANCELLED';
  const headline = data.statusMessage?.trim() || formatStatus(data.status);

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card className={cn('overflow-hidden shadow-sm', statusPresentation.frameClass)}>
        <div className={cn('h-1.5 w-full', statusPresentation.stripeClass)}></div>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className={cn('relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm', statusPresentation.iconWrapClass)}>
                  {isActiveStatus && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute inset-0 rounded-2xl animate-pulse opacity-60',
                        statusPresentation.pulseClass,
                      )}
                    />
                  )}
                  <StatusIcon size={28} className={cn('relative z-10', statusPresentation.iconClass)} />
                </div>

                <div className="space-y-2">
                  <StatusBadge status={data.status} size="md" dot />
                  <p className={cn('text-xl font-bold leading-snug', statusPresentation.headlineClass)}>
                    {headline}
                  </p>
                </div>
              </div>

              {data.lastUpdatedAt && (
                <span
                  title={formatDateTime(data.lastUpdatedAt)}
                  className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm border border-gray-100"
                >
                  {formatRelativeTime(data.lastUpdatedAt)}
                </span>
              )}
            </div>

            <div className={cn('rounded-xl border px-4 py-3 text-sm font-medium shadow-sm', statusPresentation.messageClass)}>
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="leading-relaxed">{headline}</p>
              </div>
            </div>

            {data.nextSuggestedAction && (
              <div
                className={cn(
                  'flex items-start gap-3 rounded-xl border px-4 py-3.5 text-left shadow-sm',
                  statusPresentation.suggestionClass,
                )}
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium leading-relaxed">{data.nextSuggestedAction}</p>
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
