// src/components/citizen/citizen-status-card.tsx
'use client';

import type React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  HeartPulse,
  MapPinned,
  PackageOpen,
  Phone,
  Route,
  Truck,
  User,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { CopyButton } from '@/components/shared/copy-button';
import { LocationSummary } from '@/components/citizen/location-summary';
import { CitizenStatusResponse, RequestStatus } from '@/types/rescue';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date';
import { formatPriorityLevel, formatRequestType, formatStatus } from '@/lib/utils/format';
import { parseSpecialNeeds } from '@/lib/utils/special-needs';
import { isSupportedRequestType, type SupportedRequestType } from '@/lib/config/request-types';
import { cn } from '@/lib/utils/cn';

interface CitizenStatusCardProps {
  data: CitizenStatusResponse;
  incidentDescription?: string;
}

const STATUS_META: Record<
  RequestStatus,
  {
    icon: LucideIcon;
    panel: string;
    iconBox: string;
    stripe: string;
  }
> = {
  SUBMITTED: {
    icon: FileText,
    panel: 'border-slate-200 bg-slate-50',
    iconBox: 'bg-slate-950 text-white',
    stripe: 'bg-slate-500',
  },
  TRIAGED: {
    icon: AlertCircle,
    panel: 'border-amber-200 bg-amber-50',
    iconBox: 'bg-amber-300 text-slate-950',
    stripe: 'bg-amber-300',
  },
  ASSIGNED: {
    icon: Truck,
    panel: 'border-blue-200 bg-blue-50',
    iconBox: 'bg-blue-600 text-white',
    stripe: 'bg-blue-500',
  },
  IN_PROGRESS: {
    icon: Clock,
    panel: 'border-cyan-200 bg-cyan-50',
    iconBox: 'bg-cyan-300 text-slate-950',
    stripe: 'bg-cyan-300',
  },
  RESOLVED: {
    icon: CheckCircle2,
    panel: 'border-emerald-200 bg-emerald-50',
    iconBox: 'bg-emerald-500 text-white',
    stripe: 'bg-emerald-400',
  },
  CANCELLED: {
    icon: XCircle,
    panel: 'border-rose-200 bg-rose-50',
    iconBox: 'bg-rose-500 text-white',
    stripe: 'bg-rose-500',
  },
};

const REQUEST_TYPE_META: Record<
  SupportedRequestType,
  { icon: LucideIcon; className: string; iconClassName: string }
> = {
  MEDICAL: {
    icon: HeartPulse,
    className: 'border-rose-200 bg-rose-50 text-rose-800',
    iconClassName: 'bg-rose-500 text-white',
  },
  EVACUATION: {
    icon: Route,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    iconClassName: 'bg-amber-300 text-slate-950',
  },
  SUPPLY: {
    icon: PackageOpen,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    iconClassName: 'bg-emerald-500 text-white',
  },
};

function InfoBlock({
  icon,
  label,
  children,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-4', className)}>
      <div className="flex items-center gap-2 text-xs font-black text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-bold leading-6 text-slate-950">{children}</div>
    </div>
  );
}

export function CitizenStatusCard({ data, incidentDescription }: CitizenStatusCardProps) {
  const statusMeta = STATUS_META[data.status];
  const StatusIcon = statusMeta.icon;
  const headline = data.statusMessage?.trim() || formatStatus(data.status);
  const requestTypeMeta = isSupportedRequestType(data.requestType)
    ? REQUEST_TYPE_META[data.requestType]
    : undefined;
  const RequestTypeIcon = requestTypeMeta?.icon ?? FileText;
  const parsedSpecialNeeds = parseSpecialNeeds(data.specialNeeds);
  const specialNeedChips =
    parsedSpecialNeeds.mode === 'chip'
      ? (parsedSpecialNeeds.items ?? [])
      : parsedSpecialNeeds.text
        ? [parsedSpecialNeeds.text]
        : [];

  return (
    <div className="space-y-5">
      <section className={cn('overflow-hidden rounded-[30px] border', statusMeta.panel)}>
        <div className={cn('h-3 w-full', statusMeta.stripe)} />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px]',
                  statusMeta.iconBox,
                )}
              >
                <StatusIcon size={32} />
              </div>
              <div>
                <StatusBadge status={data.status} size="md" dot />
                <h1 className="mt-3 text-2xl font-black leading-tight tracking-normal text-slate-950">
                  {headline}
                </h1>
                {data.lastUpdatedAt && (
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    อัปเดตล่าสุด {formatRelativeTime(data.lastUpdatedAt)}
                  </p>
                )}
              </div>
            </div>

            {data.lastUpdatedAt && (
              <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-500">
                {formatDateTime(data.lastUpdatedAt)}
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-white bg-white p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-slate-500" />
                <p className="text-sm font-bold leading-6 text-slate-800">{headline}</p>
              </div>
            </div>
            {data.nextSuggestedAction && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black text-amber-700">คำแนะนำถัดไป</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-amber-900">
                  {data.nextSuggestedAction}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-cyan-700">Request detail</p>
            <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">
              รายละเอียดคำขอ
            </h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <FileText size={22} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoBlock icon={<FileText size={14} />} label="รหัสคำขออ้างอิง">
            <div className="flex flex-wrap items-center gap-2">
              <span className="break-all rounded-xl bg-slate-100 px-3 py-1.5 font-mono text-xs font-black">
                {data.requestId}
              </span>
              <CopyButton text={data.requestId} />
            </div>
          </InfoBlock>

          <InfoBlock icon={<MapPinned size={14} />} label="รหัสเหตุการณ์ภัยพิบัติ">
            <div className="flex flex-wrap items-center gap-2">
              <span className="break-all rounded-xl bg-slate-100 px-3 py-1.5 font-mono text-xs font-black">
                {data.incidentId}
              </span>
              <CopyButton text={data.incidentId} />
            </div>
          </InfoBlock>

          <InfoBlock icon={<MapPinned size={14} />} label="เหตุการณ์ภัยพิบัติ" className="sm:col-span-2">
            {incidentDescription || data.incidentId}
          </InfoBlock>

          <InfoBlock label="ประเภทความช่วยเหลือ">
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-2xl border px-3 py-2',
                requestTypeMeta?.className ?? 'border-slate-200 bg-slate-50 text-slate-800',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl',
                  requestTypeMeta?.iconClassName ?? 'bg-slate-950 text-white',
                )}
              >
                <RequestTypeIcon size={18} />
              </span>
              <span className="font-black">{formatRequestType(data.requestType)}</span>
            </div>
          </InfoBlock>

          <InfoBlock icon={<Users size={14} />} label="จำนวนผู้ประสบภัย">
            {data.peopleCount ?? '-'} คน
          </InfoBlock>

          <InfoBlock label="ระดับความเร่งด่วน">
            {data.priorityLevel ? formatPriorityLevel(data.priorityLevel) : 'รอการประเมิน'}
          </InfoBlock>

          <InfoBlock label="รายละเอียดสถานการณ์" className="sm:col-span-2">
            {data.description || '-'}
          </InfoBlock>

          {data.specialNeeds && (
            <InfoBlock label="ความต้องการพิเศษ" className="sm:col-span-2">
              {specialNeedChips.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {specialNeedChips.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                '-'
              )}
            </InfoBlock>
          )}
        </div>
      </section>

      <LocationSummary location={data.location} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-black tracking-normal text-slate-950">ข้อมูลผู้ติดต่อ</h2>
          <div className="mt-4 grid gap-3">
            <InfoBlock icon={<User size={14} />} label="ชื่อผู้ติดต่อ">
              {data.contactName || '-'}
            </InfoBlock>
            <InfoBlock icon={<Phone size={14} />} label="เบอร์โทรศัพท์">
              <span className="font-mono">{data.contactPhoneMasked || '-'}</span>
            </InfoBlock>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-black tracking-normal text-slate-950">ข้อมูลเวลา</h2>
          <div className="mt-4 grid gap-3">
            <InfoBlock icon={<Clock size={14} />} label="ยื่นคำขอเมื่อ">
              {data.submittedAt ? formatDateTime(data.submittedAt) : '-'}
            </InfoBlock>
            <InfoBlock icon={<Clock size={14} />} label="อัปเดตล่าสุด">
              {data.lastUpdatedAt ? formatRelativeTime(data.lastUpdatedAt) : '-'}
            </InfoBlock>
          </div>
        </section>
      </div>

      {data.assignedUnitId && (
        <section className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-lg font-black tracking-normal text-emerald-950">
            หน่วยงานที่รับผิดชอบ
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoBlock icon={<Truck size={14} />} label="ทีมปฏิบัติการ">
              {data.assignedUnitId}
            </InfoBlock>
            {data.assignedAt && (
              <InfoBlock icon={<Clock size={14} />} label="มอบหมายงานเมื่อ">
                {formatDateTime(data.assignedAt)}
              </InfoBlock>
            )}
          </div>
        </section>
      )}

      {data.latestNote && (
        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-black text-amber-700">หมายเหตุล่าสุดจากเจ้าหน้าที่</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-amber-950">{data.latestNote}</p>
        </section>
      )}
    </div>
  );
}
