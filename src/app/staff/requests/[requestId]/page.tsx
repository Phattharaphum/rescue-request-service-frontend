// src/app/staff/requests/[requestId]/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ClipboardList, MessageSquarePlus, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { ErrorAlert } from '@/components/shared/error-alert';
import { RequestMasterCard } from '@/components/staff/request-master-card';
import { CurrentStateCard } from '@/components/staff/current-state-card';
import { StateActionPanel } from '@/components/staff/state-action-panel';
import { EventsList } from '@/components/staff/events-list';
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
    <div className="space-y-5">
      <div className="h-32 animate-pulse rounded-[30px] border border-slate-200 bg-white" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-[28px] border border-slate-200 bg-white" />
        <div className="h-96 animate-pulse rounded-[28px] border border-slate-200 bg-white" />
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
    return <span className="text-sm text-slate-400">-</span>;
  }

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

function UpdatePayloadContent({ item }: { item: CitizenUpdateItem }) {
  const payload = (item.updatePayload ?? {}) as Record<string, unknown>;

  switch (item.updateType) {
    case 'NOTE':
      return <p className="text-sm font-semibold leading-6 text-slate-700">{formatPayloadValue(payload.note)}</p>;
    case 'LOCATION_DETAILS':
      return <p className="text-sm font-semibold leading-6 text-slate-700">{formatPayloadValue(payload.locationDetails)}</p>;
    case 'PEOPLE_COUNT':
      return (
        <p className="text-sm font-semibold text-slate-700">
          จำนวนผู้ประสบภัยล่าสุด:{' '}
          <span className="font-black text-slate-950">{formatPayloadValue(payload.peopleCount)}</span> คน
        </p>
      );
    case 'SPECIAL_NEEDS':
      return <SpecialNeedsChips value={payload.specialNeeds} />;
    case 'CONTACT_INFO': {
      const hasName = !!payload.contactName;
      const hasPhone = !!payload.contactPhone;

      return (
        <div className="space-y-1.5 text-sm font-semibold text-slate-700">
          <p>
            <span className="text-slate-500">ชื่อผู้ติดต่อ:</span>{' '}
            <span className="font-black text-slate-950">
              {hasName ? formatPayloadValue(payload.contactName) : '-'}
            </span>
          </p>
          <p>
            <span className="text-slate-500">เบอร์โทรศัพท์:</span>{' '}
            <span className="font-black text-slate-950">
              {hasPhone ? formatPayloadValue(payload.contactPhone) : '-'}
            </span>
          </p>
        </div>
      );
    }
    default:
      return (
        <div className="space-y-1.5 text-sm font-semibold text-slate-700">
          {Object.entries(payload).map(([key, value]) => (
            <p key={key}>
              <span className="text-slate-500">{key}: </span>
              <span className="font-black text-slate-950">{formatPayloadValue(value)}</span>
            </p>
          ))}
        </div>
      );
  }
}

function CitizenUpdatesPanel({ updateItems }: { updateItems: CitizenUpdateItem[] }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-cyan-700">Citizen updates</p>
          <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">
            การอัปเดตจากผู้แจ้งเหตุ
          </h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-200 text-slate-950">
          <MessageSquarePlus size={22} />
        </div>
      </div>

      {updateItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center">
          <p className="text-sm font-bold text-slate-500">
            ยังไม่มีข้อมูลอัปเดตเพิ่มเติมจากผู้แจ้ง
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {updateItems.map((item) => (
            <div key={item.updateId} className="space-y-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="blue" size="sm">
                  {formatUpdateType(item.updateType)}
                </Badge>
                <span className="text-xs font-bold text-slate-400">ID: {item.updateId.slice(0, 8)}</span>
                <span className="ml-auto text-xs font-bold text-slate-500">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>

              <div className="rounded-xl border border-cyan-100 bg-white p-4">
                <UpdatePayloadContent item={item} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function RequestDetailPage({ params }: PageProps) {
  const { requestId } = React.use(params);
  const queryClient = useQueryClient();
  const [isSyncingAfterAction, setIsSyncingAfterAction] = React.useState(false);
  const [eventsRefreshToken, setEventsRefreshToken] = React.useState(0);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
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
            !expectedVersion ||
            (latestEventVersion !== undefined && latestEventVersion >= expectedVersion);

          if (isDetailUpdated && isEventUpdated) break;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['request-detail', requestId] }),
          queryClient.invalidateQueries({ queryKey: ['events', requestId] }),
        ]);

        setEventsRefreshToken((value) => value + 1);
      } finally {
        setIsSyncingAfterAction(false);
      }
    },
    [queryClient, refetch, requestId],
  );

  const updateItems = data?.updateItems ?? data?.citizenUpdates ?? [];

  return (
    <AppShell variant="staff">
      <div className="mx-auto max-w-350 space-y-5">
        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white">
          <div className="grid h-3 grid-cols-4">
            <span className="bg-cyan-300" />
            <span className="bg-emerald-400" />
            <span className="bg-amber-300" />
            <span className="bg-rose-500" />
          </div>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div>
              <Link
                href="/admin/incident"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-black text-slate-600 transition-colors hover:bg-white"
              >
                <ArrowLeft size={15} />
                กลับแดชบอร์ด
              </Link>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-black text-cyan-700">
                <ClipboardList size={16} />
                Request detail
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                รายละเอียดคำขอ
              </h1>
              <p className="mt-2 break-all font-mono text-sm font-bold text-slate-500">{requestId}</p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              disabled={isFetching}
            >
              <RefreshCw size={17} className={isFetching ? 'animate-spin' : ''} />
              รีเฟรชข้อมูล
            </button>
          </div>
        </section>

        {isLoading && <DetailSkeleton />}
        {error && <ErrorAlert message="ไม่สามารถโหลดข้อมูลคำขอได้ กรุณาลองใหม่อีกครั้ง" />}

        {isSyncingAfterAction && (
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-3.5 text-sm font-bold text-cyan-800">
            <RefreshCw size={16} className="animate-spin" />
            กำลังซิงก์ข้อมูลสถานะล่าสุดจากระบบ...
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
              <RequestMasterCard master={data.master} />

              <div className="space-y-5 lg:sticky lg:top-24">
                <CurrentStateCard state={data.currentState} />
                <StateActionPanel
                  requestId={requestId}
                  status={data.currentState.status}
                  stateVersion={data.currentState.stateVersion}
                  onSuccess={handleActionSuccess}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
              <EventsList key={`${requestId}-${eventsRefreshToken}`} requestId={requestId} />
              <CitizenUpdatesPanel updateItems={updateItems} />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
