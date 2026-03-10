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

function EventTimeline({ events }: { events: StatusEvent[] }) {
  if (events.length === 0) {
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
          {events.map((event, idx) => (
            <div key={event.eventId} className="relative pl-5">
              {idx < events.length - 1 && (
                <div className="absolute left-[7px] top-4 bottom-[-18px] w-px bg-gray-200" />
              )}
              <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-blue-500 bg-white" />

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={event.newStatus} size="sm" dot />
                  <span className="text-xs text-gray-500">v{event.version}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {formatDateTime(event.occurredAt)}
                  </span>
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

                {(event.changeReason ||
                  event.responderUnitId ||
                  (event.priorityScore !== null && event.priorityScore !== undefined)) && (
                  <div className="text-xs text-gray-600 space-y-1">
                    {event.changeReason && <p>เหตุผล: {event.changeReason}</p>}
                    {event.responderUnitId && <p>หน่วยปฏิบัติการ: {event.responderUnitId}</p>}
                    {event.priorityScore !== null && event.priorityScore !== undefined && (
                      <p>คะแนนความเร่งด่วน: {event.priorityScore}</p>
                    )}
                  </div>
                )}

                {event.meta && Object.keys(event.meta).length > 0 && (
                  <div className="text-xs text-gray-700 rounded-md border border-gray-200 bg-white p-2">
                    <p className="mb-1 font-medium text-gray-600">ข้อมูลเพิ่มเติม</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
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

function UpdateItemsSection({ items }: { items: CitizenUpdateItem[] }) {
  return (
    <Card>
      <CardHeader title="ข้อมูลเพิ่มเติมจากผู้แจ้ง" />
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">ยังไม่มีการส่งข้อมูลเพิ่มเติม</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.updateId}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="blue" size="sm">
                    {formatUpdateType(item.updateType)}
                  </Badge>
                  <span className="text-xs text-gray-500">{item.updateId}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>

                <div className="text-sm text-gray-700 rounded-md border border-gray-200 bg-white p-2 space-y-1">
                  {Object.entries(item.updatePayload ?? {}).length === 0 ? (
                    <p>-</p>
                  ) : (
                    Object.entries(item.updatePayload ?? {}).map(([key, value]) => (
                      <p key={key}>
                        <span className="text-gray-500">{key}: </span>
                        <span>{formatValue(value)}</span>
                      </p>
                    ))
                  )}
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
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          title="Request Status"
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Lookup', href: '/citizen/track' },
            { label: 'Status' },
          ]}
          actions={(
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          )}
        />

        {isLoading && <LoadingState message="Loading status..." />}
        {error && <ErrorAlert message="Unable to load request status" />}
        {data && (
          <>
            <CitizenStatusCard data={data} />
            <EventTimeline events={data.recentEvents ?? []} />
          </>
        )}

        {data && isDetailLoading && <LoadingState message="กำลังโหลดข้อมูลเพิ่มเติม..." />}
        {data && detailError && (
          <ErrorAlert message="ไม่สามารถโหลดรายการข้อมูลเพิ่มเติมจากผู้แจ้งได้" />
        )}
        {data && !isDetailLoading && !detailError && (
          <UpdateItemsSection items={updateItems} />
        )}

        {data && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={updatesHref} className="flex-1">
              <Button className="w-full" variant="primary">
                Send Additional Info
              </Button>
            </Link>
            <Link href="/citizen/track" className="flex-1">
              <Button className="w-full" variant="outline">
                Lookup Another Request
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
