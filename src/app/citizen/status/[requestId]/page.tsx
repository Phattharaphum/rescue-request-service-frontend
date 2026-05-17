// src/app/citizen/status/[requestId]/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, MessageSquarePlus, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { CitizenStatusCard } from '@/components/citizen/citizen-status-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { getCitizenStatus, getRequestDetail } from '@/lib/api/rescue';
import { formatDateTime } from '@/lib/utils/date';
import { formatStatus, formatUpdateType } from '@/lib/utils/format';
import { parseSpecialNeeds } from '@/lib/utils/special-needs';
import { CitizenUpdateItem, StatusEvent } from '@/types/rescue';
import { useIncidents } from '@/lib/hooks/use-incidents';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatDurationBetween(fromIso: string, toIso: string): string {
  const diffMs = Math.max(0, new Date(toIso).getTime() - new Date(fromIso).getTime());
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const day = Math.floor(totalMinutes / (60 * 24));
  const hour = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minute = totalMinutes % 60;

  const parts: string[] = [];
  if (day > 0) parts.push(`${day} วัน`);
  if (hour > 0) parts.push(`${hour} ชั่วโมง`);
  if (minute > 0 || parts.length === 0) parts.push(`${minute} นาที`);

  return parts.join(' ');
}

function EventTimeline({ events }: { events: StatusEvent[] }) {
  const orderedEvents = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );
  const latestEventId = orderedEvents[orderedEvents.length - 1]?.eventId;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-cyan-700">Timeline</p>
          <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">
            ประวัติการดำเนินการ
          </h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Clock size={22} />
        </div>
      </div>

      {orderedEvents.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
          ยังไม่มีประวัติการเปลี่ยนสถานะ
        </p>
      ) : (
        <ol className="relative space-y-4 border-l border-slate-200 pl-5">
          {orderedEvents.map((event, index) => {
            const isLatest = event.eventId === latestEventId;

            return (
              <li key={event.eventId} className="relative">
                <span
                  className={`absolute -left-[1.72rem] top-5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                    isLatest ? 'bg-cyan-500' : 'bg-slate-300'
                  }`}
                />
                <div
                  className={`rounded-2xl border p-4 ${
                    isLatest ? 'border-cyan-200 bg-cyan-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={event.newStatus} size="sm" dot />
                    {isLatest && <Badge variant="blue" size="sm">ล่าสุด</Badge>}
                    <span className="text-xs font-bold text-slate-400">ครั้งที่ {event.version}</span>
                    <span className="ml-auto text-xs font-bold text-slate-500">
                      {formatDateTime(event.occurredAt)}
                    </span>
                  </div>

                  <div className="mt-3 text-sm font-bold text-slate-900">
                    {event.previousStatus ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-500 line-through">
                          {formatStatus(event.previousStatus)}
                        </span>
                        <ArrowRight size={15} className="text-slate-400" />
                        <span className="text-cyan-700">{formatStatus(event.newStatus)}</span>
                      </div>
                    ) : (
                      <span className="text-cyan-700">
                        เริ่มต้นคำขอ: {formatStatus(event.newStatus)}
                      </span>
                    )}
                  </div>

                  {index > 0 && (
                    <p className="mt-2 text-xs font-bold text-slate-500">
                      ใช้เวลาดำเนินการ:{' '}
                      <span className="text-slate-700">
                        {formatDurationBetween(orderedEvents[index - 1].occurredAt, event.occurredAt)}
                      </span>
                    </p>
                  )}

                  {(event.changeReason ||
                    event.responderUnitId ||
                    (event.priorityScore !== null && event.priorityScore !== undefined)) && (
                    <div className="mt-3 space-y-1.5 rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-600">
                      {event.changeReason && (
                        <p>
                          <span className="font-black text-slate-900">เหตุผล:</span>{' '}
                          {event.changeReason}
                        </p>
                      )}
                      {event.responderUnitId && (
                        <p>
                          <span className="font-black text-slate-900">หน่วยปฏิบัติการ:</span>{' '}
                          {event.responderUnitId}
                        </p>
                      )}
                      {event.priorityScore !== null && event.priorityScore !== undefined && (
                        <p>
                          <span className="font-black text-slate-900">คะแนนความเร่งด่วน:</span>{' '}
                          {event.priorityScore}
                        </p>
                      )}
                    </div>
                  )}

                  {event.meta && Object.keys(event.meta).length > 0 && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
                      <p className="mb-2 font-black text-slate-900">ข้อมูลเชิงลึกเพิ่มเติม</p>
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {Object.entries(event.meta).map(([key, value]) => (
                          <p key={key} className="truncate">
                            <span className="font-bold text-slate-500">{key}: </span>
                            <span className="text-slate-900">{formatValue(value)}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function SpecialNeedsChips({ value }: { value: unknown }) {
  const parsed = parseSpecialNeeds(value);
  const chips = parsed.mode === 'chip' ? (parsed.items ?? []) : parsed.text ? [parsed.text] : [];

  if (chips.length === 0) return <span className="text-slate-400">-</span>;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function UpdatePayloadSummary({ item }: { item: CitizenUpdateItem }) {
  const payload = (item.updatePayload ?? {}) as Record<string, unknown>;

  switch (item.updateType) {
    case 'SPECIAL_NEEDS':
      return <SpecialNeedsChips value={payload.specialNeeds} />;
    case 'NOTE':
      return <p>{formatValue(payload.note)}</p>;
    case 'LOCATION_DETAILS':
      return <p>{formatValue(payload.locationDetails)}</p>;
    case 'PEOPLE_COUNT':
      return (
        <p>
          จำนวนผู้ประสบภัย: <span className="font-black">{formatValue(payload.peopleCount)}</span>{' '}
          คน
        </p>
      );
    case 'CONTACT_INFO':
      return (
        <div className="space-y-1.5">
          <p>
            ชื่อผู้ติดต่อ: <span className="font-black">{formatValue(payload.contactName)}</span>
          </p>
          <p>
            เบอร์โทรศัพท์: <span className="font-black">{formatValue(payload.contactPhone)}</span>
          </p>
        </div>
      );
    default:
      if (Object.entries(payload).length === 0) return <p className="text-slate-400">-</p>;
      return (
        <div className="space-y-1">
          {Object.entries(payload).map(([key, value]) => (
            <p key={key}>
              <span className="font-bold text-slate-500">{key}: </span>
              <span>{formatValue(value)}</span>
            </p>
          ))}
        </div>
      );
  }
}

function UpdateItemsSection({ items }: { items: CitizenUpdateItem[] }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-cyan-700">Citizen updates</p>
          <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">
            ข้อมูลเพิ่มเติมจากผู้แจ้ง
          </h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-200 text-slate-950">
          <MessageSquarePlus size={22} />
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
          ยังไม่มีการแจ้งข้อมูลเพิ่มเติม
        </p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.updateId} className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="blue" size="sm">
                  {formatUpdateType(item.updateType)}
                </Badge>
                <span className="ml-auto text-xs font-bold text-slate-500">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>

              <div className="mt-3 rounded-xl border border-cyan-100 bg-white p-3 text-sm font-semibold leading-6 text-slate-700">
                <UpdatePayloadSummary item={item} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function CitizenStatusPage({ params }: PageProps) {
  const { requestId } = React.use(params);
  const searchParams = useSearchParams();
  const trackingCode = searchParams.get('trackingCode') ?? '';
  const updatesHref = trackingCode
    ? `/citizen/status/${requestId}/updates?trackingCode=${encodeURIComponent(trackingCode)}`
    : `/citizen/status/${requestId}/updates`;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['citizen-status', requestId],
    queryFn: () => getCitizenStatus(requestId),
    refetchInterval: 30000,
  });

  const {
    data: detailData,
    isLoading: isDetailLoading,
    error: detailError,
  } = useQuery({
    queryKey: ['request-detail', requestId, 'citizen-status-page'],
    queryFn: () => getRequestDetail(requestId, { includeCitizenUpdates: true }),
    refetchInterval: 30000,
    enabled: Boolean(requestId),
  });

  const updateItems = detailData?.updateItems ?? detailData?.citizenUpdates ?? [];
  const { incidents } = useIncidents();
  const incidentDescription = data
    ? incidents.find((incident) => incident.value === data.incidentId)?.description
    : undefined;

  return (
    <AppShell variant="citizen">
      <div className="mx-auto max-w-4xl space-y-5 py-6">
        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white">
          <div className="grid h-3 grid-cols-4">
            <span className="bg-cyan-300" />
            <span className="bg-emerald-400" />
            <span className="bg-amber-300" />
            <span className="bg-rose-500" />
          </div>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-black text-cyan-700">Request status</p>
              <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
                สถานะคำขอช่วยเหลือ
              </h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                ติดตามความคืบหน้า ตรวจสอบประวัติ และแจ้งรายละเอียดเพิ่มเติมให้ทีมช่วยเหลือ
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 transition-colors hover:bg-white disabled:opacity-60 sm:w-auto"
              disabled={isFetching}
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
              รีเฟรชข้อมูล
            </button>
          </div>
        </section>

        {isLoading && <LoadingState message="กำลังโหลดสถานะล่าสุดของคุณ..." />}
        {error && (
          <ErrorAlert message="ไม่สามารถโหลดข้อมูลสถานะคำขอได้ กรุณาลองใหม่อีกครั้ง" />
        )}

        {data && (
          <div className="space-y-5">
            <CitizenStatusCard data={data} incidentDescription={incidentDescription} />
            <EventTimeline events={data.recentEvents ?? []} />
          </div>
        )}

        {data && isDetailLoading && <LoadingState message="กำลังโหลดข้อมูลเพิ่มเติม..." />}
        {data && detailError && (
          <ErrorAlert message="ไม่สามารถโหลดข้อมูลเพิ่มเติมจากผู้แจ้งได้" />
        )}
        {data && !isDetailLoading && !detailError && <UpdateItemsSection items={updateItems} />}

        {data && (
          <div className="border-t border-slate-200 pt-5">
            <Link
              href={updatesHref}
              className="group flex min-h-16 items-center justify-between gap-4 rounded-2xl bg-slate-950 px-5 py-4 text-white transition-colors hover:bg-slate-800 active:scale-[0.99]"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-slate-950">
                  <MessageSquarePlus size={22} />
                </span>
                <span className="text-sm font-black">แจ้งรายละเอียดอัปเดตเพิ่มเติม</span>
              </span>
              <ArrowRight size={19} className="shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
