'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { CitizenStatusCard } from '@/components/citizen/citizen-status-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { getCitizenStatus, getRequestDetail } from '@/lib/api/rescue';
import { formatDateTime } from '@/lib/utils/date';
import { formatStatus, formatUpdateType } from '@/lib/utils/format';
import { parseSpecialNeeds } from '@/lib/utils/special-needs';
import { CitizenUpdateItem, StatusEvent } from '@/types/rescue';

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

  if (orderedEvents.length === 0) {
    return (
      <Card>
        <CardHeader title="ไทม์ไลน์สถานะ" />
        <CardContent>
          <p className="text-sm text-gray-500">ยังไม่มีประวัติการเปลี่ยนสถานะ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="ไทม์ไลน์สถานะ" />
      <CardContent>
        <div className="space-y-4">
          {orderedEvents.map((event, idx) => (
            <div key={event.eventId} className="relative pl-5">
              {idx < orderedEvents.length - 1 && (
                <div className="absolute bottom-[-18px] left-[7px] top-4 w-px bg-gray-200" />
              )}
              <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-blue-500 bg-white" />

              <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={event.newStatus} size="sm" dot />
                  <span className="text-xs text-gray-500">v{event.version}</span>
                  <span className="ml-auto text-xs text-gray-500">{formatDateTime(event.occurredAt)}</span>
                </div>

                <div className="text-sm text-gray-700">
                  {event.previousStatus ? (
                    <span>
                      {formatStatus(event.previousStatus)} → {formatStatus(event.newStatus)}
                    </span>
                  ) : (
                    <span>เริ่มต้นคำขอ: {formatStatus(event.newStatus)}</span>
                  )}
                </div>

                {idx > 0 && (
                  <p className="text-xs text-blue-700">
                    ใช้เวลาเปลี่ยนจากสถานะก่อนหน้า:{' '}
                    {formatDurationBetween(orderedEvents[idx - 1].occurredAt, event.occurredAt)}
                  </p>
                )}

                {(event.changeReason ||
                  event.responderUnitId ||
                  (event.priorityScore !== null && event.priorityScore !== undefined)) && (
                  <div className="space-y-1 text-xs text-gray-600">
                    {event.changeReason && <p>เหตุผล: {event.changeReason}</p>}
                    {event.responderUnitId && <p>หน่วยปฏิบัติการ: {event.responderUnitId}</p>}
                    {event.priorityScore !== null && event.priorityScore !== undefined && (
                      <p>คะแนนความเร่งด่วน: {event.priorityScore}</p>
                    )}
                  </div>
                )}

                {event.meta && Object.keys(event.meta).length > 0 && (
                  <div className="rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-700">
                    <p className="mb-1 font-medium text-gray-600">ข้อมูลเพิ่มเติม</p>
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {Object.entries(event.meta).map(([key, value]) => (
                        <p key={key}>
                          <span className="text-gray-500">{key}: </span>
                          <span>{formatValue(value)}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


function SpecialNeedsChips({ value }: { value: unknown }) {
  const parsed = parseSpecialNeeds(typeof value === 'string' ? value : '');
  const chips = parsed.mode === 'chip' ? (parsed.items ?? []) : parsed.text ? [parsed.text] : [];

  if (chips.length === 0) return <span className="text-gray-500">-</span>;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700"
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
      return <p>People affected: {formatValue(payload.peopleCount)}</p>;
    case 'CONTACT_INFO':
      return (
        <div className="space-y-1">
          <p>Contact name: {formatValue(payload.contactName)}</p>
          <p>Contact phone: {formatValue(payload.contactPhone)}</p>
        </div>
      );
    default:
      if (Object.entries(payload).length === 0) return <p>-</p>;
      return (
        <>
          {Object.entries(payload).map(([key, value]) => (
            <p key={key}>
              <span className="text-gray-500">{key}: </span>
              <span>{formatValue(value)}</span>
            </p>
          ))}
        </>
      );
  }
}

function UpdateItemsSection({ items }: { items: CitizenUpdateItem[] }) {
  return (
    <Card>
      <CardHeader title="Additional Information From Reporter" />
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No additional updates yet</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.updateId} className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="blue" size="sm">
                    {formatUpdateType(item.updateType)}
                  </Badge>
                  <span className="text-xs text-gray-500">{item.updateId}</span>
                  <span className="ml-auto text-xs text-gray-500">{formatDateTime(item.createdAt)}</span>
                </div>

                <div className="space-y-1 rounded-md border border-gray-200 bg-white p-2 text-sm text-gray-700">
                  <UpdatePayloadSummary item={item} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CitizenStatusPage({ params }: PageProps) {
  const { requestId } = React.use(params);
  const searchParams = useSearchParams();
  const trackingCode = searchParams.get('trackingCode') ?? '';
  const updatesHref = trackingCode
    ? `/citizen/status/${requestId}/updates?trackingCode=${encodeURIComponent(trackingCode)}`
    : `/citizen/status/${requestId}/updates`;

  const { data, isLoading, error, refetch } = useQuery({
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

  return (
    <AppShell variant="citizen">
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title="สถานะคำขอช่วยเหลือ"
          breadcrumbs={[
            { label: 'หน้าหลัก', href: '/' },
            { label: 'ค้นหาสถานะคำขอ', href: '/citizen/track' },
            { label: 'สถานะคำขอ' },
          ]}
          actions={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              รีเฟรช
            </Button>
          }
        />

        {isLoading && <LoadingState message="กำลังโหลดสถานะคำขอ..." />}
        {error && <ErrorAlert message="ไม่สามารถโหลดสถานะคำขอได้" />}
        {data && (
          <>
            <CitizenStatusCard data={data} />
            <EventTimeline events={data.recentEvents ?? []} />
          </>
        )}

        {data && isDetailLoading && <LoadingState message="กำลังโหลดข้อมูลเพิ่มเติม..." />}
        {data && detailError && <ErrorAlert message="ไม่สามารถโหลดข้อมูลเพิ่มเติมจากผู้แจ้งได้" />}
        {data && !isDetailLoading && !detailError && <UpdateItemsSection items={updateItems} />}

        {data && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={updatesHref} className="flex-1">
              <Button className="w-full" variant="primary">
                แจ้งรายละเอียดเพิ่มเติม
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
