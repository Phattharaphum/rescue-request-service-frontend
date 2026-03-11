// src/app/citizen/status/[requestId]/page.tsx
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
        <CardHeader title="ประวัติการดำเนินการ" />
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีประวัติการเปลี่ยนสถานะ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="ประวัติการดำเนินการ" />
      <CardContent>
        <div className="space-y-6 mt-2">
          {orderedEvents.map((event, idx) => (
            <div key={event.eventId} className="relative pl-6">
              {idx < orderedEvents.length - 1 && (
                <div className="absolute -bottom-6 left-2.25 top-6 w-px bg-blue-100" />
              )}
              <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border-4 border-white bg-blue-500 shadow-sm" />

              <div className="space-y-2.5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={event.newStatus} size="sm" dot />
                  <span className="text-xs font-medium text-gray-400">ครั้งที่ {event.version}</span>
                  <span className="ml-auto text-xs font-medium text-gray-500">{formatDateTime(event.occurredAt)}</span>
                </div>

                <div className="text-sm font-medium text-gray-900">
                  {event.previousStatus ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 line-through">{formatStatus(event.previousStatus)}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-blue-700">{formatStatus(event.newStatus)}</span>
                    </div>
                  ) : (
                    <span className="text-blue-700">เริ่มต้นคำขอ: {formatStatus(event.newStatus)}</span>
                  )}
                </div>

                {idx > 0 && (
                  <p className="text-xs font-medium text-gray-500">
                    ใช้เวลาดำเนินการ: <span className="text-gray-700">{formatDurationBetween(orderedEvents[idx - 1].occurredAt, event.occurredAt)}</span>
                  </p>
                )}

                {(event.changeReason ||
                  event.responderUnitId ||
                  (event.priorityScore !== null && event.priorityScore !== undefined)) && (
                  <div className="space-y-1.5 rounded-lg bg-white p-3 text-xs text-gray-600 shadow-sm border border-gray-100">
                    {event.changeReason && <p><span className="font-semibold text-gray-900">เหตุผล:</span> {event.changeReason}</p>}
                    {event.responderUnitId && <p><span className="font-semibold text-gray-900">หน่วยปฏิบัติการ:</span> {event.responderUnitId}</p>}
                    {event.priorityScore !== null && event.priorityScore !== undefined && (
                      <p><span className="font-semibold text-gray-900">คะแนนความเร่งด่วน:</span> {event.priorityScore}</p>
                    )}
                  </div>
                )}

                {event.meta && Object.keys(event.meta).length > 0 && (
                  <div className="rounded-lg border border-gray-100 bg-white p-3 text-xs text-gray-700 shadow-sm">
                    <p className="mb-2 font-bold text-gray-900 border-b border-gray-50 pb-1">ข้อมูลเชิงลึกเพิ่มเติม</p>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {Object.entries(event.meta).map(([key, value]) => (
                        <p key={key} className="truncate">
                          <span className="font-medium text-gray-500">{key}: </span>
                          <span className="text-gray-900">{formatValue(value)}</span>
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

  if (chips.length === 0) return <span className="text-gray-400">-</span>;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
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
      return <p className="text-gray-700">{formatValue(payload.note)}</p>;
    case 'LOCATION_DETAILS':
      return <p className="text-gray-700">{formatValue(payload.locationDetails)}</p>;
    case 'PEOPLE_COUNT':
      return <p className="text-gray-700">จำนวนผู้ประสบภัย: <span className="font-semibold">{formatValue(payload.peopleCount)}</span> คน</p>;
    case 'CONTACT_INFO':
      return (
        <div className="space-y-1.5 text-gray-700">
          <p>ชื่อผู้ติดต่อ: <span className="font-semibold">{formatValue(payload.contactName)}</span></p>
          <p>เบอร์โทรศัพท์: <span className="font-semibold">{formatValue(payload.contactPhone)}</span></p>
        </div>
      );
    default:
      if (Object.entries(payload).length === 0) return <p className="text-gray-400">-</p>;
      return (
        <div className="space-y-1">
          {Object.entries(payload).map(([key, value]) => (
            <p key={key} className="text-gray-700">
              <span className="text-gray-500 font-medium">{key}: </span>
              <span>{formatValue(value)}</span>
            </p>
          ))}
        </div>
      );
  }
}

function UpdateItemsSection({ items }: { items: CitizenUpdateItem[] }) {
  return (
    <Card>
      <CardHeader title="ข้อมูลเพิ่มเติมจากผู้แจ้ง" />
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            ยังไม่มีการแจ้งข้อมูลเพิ่มเติม
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.updateId} className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="blue" size="sm">
                    {formatUpdateType(item.updateType)}
                  </Badge>
                  <span className="ml-auto text-xs font-medium text-gray-500">{formatDateTime(item.createdAt)}</span>
                </div>

                <div className="rounded-lg border border-white bg-white p-3 text-sm shadow-sm">
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
      <div className="mx-auto max-w-2xl space-y-6 py-6">
        <PageHeader
          title="สถานะคำขอช่วยเหลือ"
          breadcrumbs={[
            { label: 'หน้าหลัก', href: '/' },
            { label: 'ค้นหาสถานะ', href: '/citizen/track' },
            { label: 'สถานะคำขอ' },
          ]}
          actions={
            <Button variant="outline" size="sm" onClick={() => refetch()} className="bg-white rounded-xl shadow-sm">
              รีเฟรชข้อมูล
            </Button>
          }
        />

        {isLoading && <LoadingState message="กำลังโหลดสถานะล่าสุดของคุณ..." />}
        {error && <ErrorAlert message="ไม่สามารถโหลดข้อมูลสถานะคำขอได้ กรุณาลองใหม่อีกครั้ง" />}
        
        {data && (
          <div className="space-y-6">
            <CitizenStatusCard data={data} />
            <EventTimeline events={data.recentEvents ?? []} />
          </div>
        )}

        {data && isDetailLoading && <LoadingState message="กำลังโหลดข้อมูลเพิ่มเติม..." />}
        {data && detailError && <ErrorAlert message="ไม่สามารถโหลดข้อมูลเพิ่มเติมจากผู้แจ้งได้" />}
        {data && !isDetailLoading && !detailError && <UpdateItemsSection items={updateItems} />}

        {data && (
          <div className="pt-4 border-t border-gray-200">
            <Link href={updatesHref} className="block w-full">
              <Button className="w-full shadow-md rounded-xl" variant="primary" size="lg">
                แจ้งรายละเอียดอัปเดตเพิ่มเติม
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}