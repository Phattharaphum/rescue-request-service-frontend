// src/app/staff/requests/[requestId]/page.tsx
'use client';

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { ErrorAlert } from '@/components/shared/error-alert';
import { RequestMasterCard } from '@/components/staff/request-master-card';
import { CurrentStateCard } from '@/components/staff/current-state-card';
import { StateActionPanel } from '@/components/staff/state-action-panel';
import { EventsList } from '@/components/staff/events-list';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getRequestDetail, listRequestEvents } from '@/lib/api/rescue';
import { formatDateTime } from '@/lib/utils/date';
import { formatUpdateType } from '@/lib/utils/format';
import { parseSpecialNeeds } from '@/lib/utils/special-needs';
import { CitizenUpdateItem } from '@/types/rescue';
import { RefreshCw } from 'lucide-react';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-200" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div key={`left-${idx}`} className="h-4 w-full animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`right-${idx}`} className="mb-4 h-4 w-full animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex gap-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={`action-${idx}`} className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPayloadValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function SpecialNeedsChips({ value }: { value: unknown }) {
  const parsed = parseSpecialNeeds(value);
  const chips =
    parsed.mode === 'chip'
      ? (parsed.items ?? [])
      : parsed.text
        ? [parsed.text]
        : [];

  if (chips.length === 0) {
    return <span className="text-sm text-gray-400">-</span>;
  }

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

function UpdatePayloadContent({ item }: { item: CitizenUpdateItem }) {
  const payload = (item.updatePayload ?? {}) as Record<string, unknown>;

  switch (item.updateType) {
    case 'NOTE':
      return <p className="text-sm text-gray-700 leading-relaxed">{formatPayloadValue(payload.note)}</p>;

    case 'LOCATION_DETAILS':
      return <p className="text-sm text-gray-700 leading-relaxed">{formatPayloadValue(payload.locationDetails)}</p>;

    case 'PEOPLE_COUNT':
      return (
        <p className="text-sm text-gray-700">
          จำนวนผู้ประสบภัยล่าสุด: <span className="font-bold text-gray-900">{formatPayloadValue(payload.peopleCount)}</span> คน
        </p>
      );

    case 'SPECIAL_NEEDS':
      return <SpecialNeedsChips value={payload.specialNeeds} />;

    case 'CONTACT_INFO': {
      const hasName = !!payload.contactName;
      const hasPhone = !!payload.contactPhone;

      return (
        <div className="space-y-1.5 text-sm text-gray-700">
          <p>
            <span className="text-gray-500">ชื่อผู้ติดต่อ:</span>{' '}
            <span className="font-semibold text-gray-900">{hasName ? formatPayloadValue(payload.contactName) : '-'}</span>
          </p>
          <p>
            <span className="text-gray-500">เบอร์โทรศัพท์:</span>{' '}
            <span className="font-semibold text-gray-900">{hasPhone ? formatPayloadValue(payload.contactPhone) : '-'}</span>
          </p>
        </div>
      );
    }

    default:
      return (
        <div className="space-y-1.5 text-sm text-gray-700">
          {Object.entries(payload).map(([key, value]) => (
            <p key={key}>
              <span className="text-gray-500">{key}: </span>
              <span className="font-medium text-gray-900">{formatPayloadValue(value)}</span>
            </p>
          ))}
        </div>
      );
  }
}

export default function RequestDetailPage({ params }: PageProps) {
  const { requestId } = React.use(params);
  const queryClient = useQueryClient();
  const [isSyncingAfterAction, setIsSyncingAfterAction] = React.useState(false);
  const [eventsRefreshToken, setEventsRefreshToken] = React.useState(0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['request-detail', requestId],
    queryFn: () => getRequestDetail(requestId, { includeEvents: true, includeCitizenUpdates: true }),
  });

  const handleActionSuccess = React.useCallback(
    async (payload?: { expectedVersion?: number }) => {
      const expectedVersion = payload?.expectedVersion;
      setIsSyncingAfterAction(true);

      try {
        const maxAttempts = 10;
        const delayMs = 1000;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const [result, latestEventResult] = await Promise.all([
            refetch(),
            listRequestEvents(requestId, { limit: 1, order: 'DESC' }),
          ]);

          const latestVersion = result.data?.currentState?.stateVersion;
          const latestEventVersion = latestEventResult.items[0]?.version;

          const isDetailUpdated =
            !expectedVersion || (latestVersion !== undefined && latestVersion >= expectedVersion);
          const isEventUpdated =
            !expectedVersion || (latestEventVersion !== undefined && latestEventVersion >= expectedVersion);

          if (isDetailUpdated && isEventUpdated) {
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['request-detail', requestId] }),
          queryClient.invalidateQueries({ queryKey: ['events', requestId] }),
        ]);

        setEventsRefreshToken((v) => v + 1);
      } finally {
        setIsSyncingAfterAction(false);
      }
    },
    [queryClient, refetch, requestId],
  );

  const updateItems = data?.updateItems ?? data?.citizenUpdates ?? [];

  return (
    <AppShell variant="staff">
      <div className="space-y-6 max-w-350 mx-auto">
        <PageHeader
          title="รายละเอียดคำขอ"
          breadcrumbs={[
            { label: 'แดชบอร์ด', href: '/admin/incident' },
            { label: requestId },
          ]}
          actions={
            <Button variant="outline" size="sm" onClick={() => refetch()} className="bg-white rounded-xl shadow-sm">
              <RefreshCw size={14} className="mr-1.5" /> รีเฟรชข้อมูล
            </Button>
          }
        />

        {isLoading && <DetailSkeleton />}
        {error && <ErrorAlert message="ไม่สามารถโหลดข้อมูลคำขอได้ กรุณาลองใหม่อีกครั้ง" />}
        {isSyncingAfterAction && (
          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3.5 text-sm font-medium text-blue-800 shadow-sm animate-pulse">
            <RefreshCw size={16} className="animate-spin" /> กำลังซิงค์ข้อมูลสถานะล่าสุดจากระบบ...
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
              {/* ข้อมูลคงที่ (Master) */}
              <RequestMasterCard master={data.master} />
              
              {/* ข้อมูลที่มีการเปลี่ยนแปลง (State & Actions) */}
              <div className="space-y-6 sticky top-20">
                <CurrentStateCard state={data.currentState} />
                <StateActionPanel
                  requestId={requestId}
                  status={data.currentState.status}
                  stateVersion={data.currentState.stateVersion}
                  onSuccess={handleActionSuccess}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
              {/* Timeline (Events) */}
              <EventsList key={`${requestId}-${eventsRefreshToken}`} requestId={requestId} />

              {/* Citizen Updates */}
              <Card className="border-gray-200">
                <CardHeader title="การอัปเดตจากผู้แจ้งเหตุ" />
                <CardContent>
                  {updateItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-8 text-center">
                      <p className="text-sm text-gray-500">ยังไม่มีข้อมูลอัปเดตเพิ่มเติมจากผู้แจ้ง</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {updateItems.map((item) => (
                        <div key={item.updateId} className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/30 p-5 transition-colors hover:bg-blue-50/60">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="blue" size="sm">
                              {formatUpdateType(item.updateType)}
                            </Badge>
                            <span className="text-xs font-medium text-gray-400">ID: {item.updateId.slice(0, 8)}</span>
                            <span className="ml-auto text-xs font-semibold text-gray-500">{formatDateTime(item.createdAt)}</span>
                          </div>

                          <div className="rounded-xl border border-white bg-white p-4 shadow-sm">
                            <UpdatePayloadContent item={item} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
