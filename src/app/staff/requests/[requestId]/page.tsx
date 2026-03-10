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

interface PageProps {
  params: Promise<{ requestId: string }>;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-72 animate-pulse rounded-lg bg-gray-200" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="space-y-3">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div key={`left-${idx}`} className="h-4 w-full animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`right-${idx}`} className="mb-3 h-4 w-full animate-pulse rounded bg-gray-200" />
            ))}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={`action-${idx}`} className="mb-3 h-9 w-full animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={`timeline-${idx}`} className="mb-3 h-4 w-full animate-pulse rounded bg-gray-200" />
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={`update-${idx}`} className="mb-3 h-4 w-full animate-pulse rounded bg-gray-200" />
        ))}
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
  const parsed = parseSpecialNeeds(typeof value === 'string' ? value : '');
  const chips =
    parsed.mode === 'chip'
      ? (parsed.items ?? [])
      : parsed.text
        ? [parsed.text]
        : [];

  if (chips.length === 0) {
    return <span className="text-sm text-gray-500">-</span>;
  }

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

function UpdatePayloadContent({ item }: { item: CitizenUpdateItem }) {
  const payload = (item.updatePayload ?? {}) as Record<string, unknown>;

  switch (item.updateType) {
    case 'NOTE':
      return <p className="text-sm text-gray-700">{formatPayloadValue(payload.note)}</p>;

    case 'LOCATION_DETAILS':
      return <p className="text-sm text-gray-700">{formatPayloadValue(payload.locationDetails)}</p>;

    case 'PEOPLE_COUNT':
      return (
        <p className="text-sm text-gray-700">
          จำนวนผู้ประสบภัยล่าสุด: <span className="font-semibold">{formatPayloadValue(payload.peopleCount)}</span> คน
        </p>
      );

    case 'SPECIAL_NEEDS':
      return <SpecialNeedsChips value={payload.specialNeeds} />;

    case 'CONTACT_INFO': {
      const hasName = !!payload.contactName;
      const hasPhone = !!payload.contactPhone;

      return (
        <div className="space-y-1 text-sm text-gray-700">
          <p>
            ชื่อผู้ติดต่อ:{' '}
            <span className="font-medium">{hasName ? formatPayloadValue(payload.contactName) : '-'}</span>
          </p>
          <p>
            เบอร์โทรศัพท์:{' '}
            <span className="font-medium">{hasPhone ? formatPayloadValue(payload.contactPhone) : '-'}</span>
          </p>
        </div>
      );
    }

    default:
      return (
        <div className="space-y-1 text-sm text-gray-700">
          {Object.entries(payload).map(([key, value]) => (
            <p key={key}>
              <span className="text-gray-500">{key}: </span>
              <span>{formatPayloadValue(value)}</span>
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
      <div className="space-y-6">
        <PageHeader
          title="รายละเอียดคำขอ"
          breadcrumbs={[
            { label: 'แผงควบคุม', href: '/staff' },
            { label: 'คำขอ', href: '/staff' },
            { label: `${requestId.slice(0, 8)}...` },
          ]}
          actions={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              รีเฟรช
            </Button>
          }
        />

        {isLoading && <DetailSkeleton />}
        {error && <ErrorAlert message="ไม่สามารถโหลดข้อมูลคำขอได้" />}
        {isSyncingAfterAction && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            กำลังรอข้อมูลสถานะล่าสุดจากระบบ...
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RequestMasterCard master={data.master} />
              <div className="space-y-4">
                <CurrentStateCard state={data.currentState} />
                <StateActionPanel
                  requestId={requestId}
                  status={data.currentState.status}
                  stateVersion={data.currentState.stateVersion}
                  onSuccess={handleActionSuccess}
                />
              </div>
            </div>

            <EventsList key={`${requestId}-${eventsRefreshToken}`} requestId={requestId} />

            <Card>
              <CardHeader title="การอัปเดตจากผู้แจ้ง" />
              <CardContent>
                {updateItems.length === 0 ? (
                  <p className="text-sm text-gray-500">ยังไม่มีข้อมูลอัปเดตจากผู้แจ้ง</p>
                ) : (
                  <div className="space-y-3">
                    {updateItems.map((item) => (
                      <div key={item.updateId} className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="blue" size="sm">
                            {formatUpdateType(item.updateType)}
                          </Badge>
                          <span className="text-xs text-gray-500">{item.updateId}</span>
                          <span className="ml-auto text-xs text-gray-500">{formatDateTime(item.createdAt)}</span>
                        </div>

                        <div className="rounded-md border border-gray-200 bg-white p-3">
                          <UpdatePayloadContent item={item} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
