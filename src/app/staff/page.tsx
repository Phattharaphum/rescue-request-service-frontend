// src/app/staff/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { IncidentSelector } from '@/components/shared/incident-selector';
import { RequestsTable } from '@/components/staff/requests-table';
import { useIncident } from '@/lib/hooks/use-incident';
import { listIncidentRequests } from '@/lib/api/rescue';
import { formatStatus } from '@/lib/utils/format';
import type { RequestStatus } from '@/types/rescue';

const STATUS_OPTIONS: RequestStatus[] = [
  'SUBMITTED',
  'TRIAGED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CANCELLED',
];

export default function StaffDashboardPage() {
  const { incidentId, setIncidentId, incidents, isLoadingIncidents } = useIncident();
  const [statusFilter, setStatusFilter] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [prevCursors, setPrevCursors] = useState<string[]>([]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: [
      'incident-requests-page',
      incidentId,
      incidents.map((incident) => incident.value).join(','),
      statusFilter,
      cursor,
    ],
    queryFn: async () => {
      const status = (statusFilter as RequestStatus) || undefined;

      return listIncidentRequests(incidentId, {
        status,
        cursor,
        limit: 20,
      });
    },
    enabled: !!incidentId,
  });

  const items = data?.items ?? [];
  const nextCursor = data?.nextCursor;

  const onChangeIncident = (value: string) => {
    setIncidentId(value);
    setCursor(undefined);
    setPrevCursors([]);
  };

  const onChangeStatus = (value: string) => {
    setStatusFilter(value);
    setCursor(undefined);
    setPrevCursors([]);
  };

  const onNext = () => {
    if (!nextCursor) return;
    setPrevCursors((prev) => [...prev, cursor ?? '']);
    setCursor(nextCursor);
  };

  const onPrev = () => {
    const prev = prevCursors[prevCursors.length - 1];
    setPrevCursors((current) => current.slice(0, -1));
    setCursor(prev === '' ? undefined : prev);
  };

  const loading = isLoadingIncidents || isLoading;

  return (
    <AppShell variant="staff">
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white">
          <div className="grid h-3 grid-cols-4">
            <span className="bg-cyan-300" />
            <span className="bg-emerald-400" />
            <span className="bg-amber-300" />
            <span className="bg-rose-500" />
          </div>
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-black text-cyan-700">
                <ClipboardList size={16} />
                Admin incident dashboard
              </p>
              <h1 className="mt-5 text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                แดชบอร์ดจัดการคำขอช่วยเหลือ
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500 sm:text-base">
                คัดกรอง ติดตาม และเปิดรายละเอียดคำขอจากเหตุการณ์ภัยพิบัติที่เลือกในมุมมองเดียว
              </p>
            </div>

            <div className="grid gap-3">
              <Link
                href="/admin/pubsub"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 text-sm font-black text-cyan-700 transition-colors hover:bg-cyan-100"
              >
                <Activity size={17} />
                Pub/Sub stream
              </Link>
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
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-cyan-700">Filters</p>
              <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">กรองรายการคำขอ</h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Filter size={22} />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-end">
            <IncidentSelector
              value={incidentId}
              onChange={onChangeIncident}
              incidents={incidents}
              isLoading={isLoadingIncidents}
            />

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-black text-slate-700">
                <Filter size={14} className="text-slate-400" />
                กรองตามสถานะคำขอ
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onChangeStatus('')}
                  className={`rounded-2xl border px-4 py-2 text-sm font-black transition-colors ${
                    statusFilter === ''
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:text-slate-950'
                  }`}
                >
                  ทั้งหมด
                </button>
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onChangeStatus(status)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-black transition-colors ${
                      statusFilter === status
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:text-slate-950'
                    }`}
                  >
                    {formatStatus(status)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
          <RequestsTable items={items} isLoading={loading} />
        </section>

        <section className="flex items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white p-4">
          <button
            type="button"
            disabled={loading || prevCursors.length === 0}
            onClick={onPrev}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700 transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            ก่อนหน้า
          </button>

          <div className="text-center text-sm font-bold text-slate-500">
            {loading ? 'กำลังโหลด...' : `รายการที่ ${prevCursors.length * 20 + 1} - ${prevCursors.length * 20 + items.length}`}
          </div>

          <button
            type="button"
            disabled={loading || !nextCursor}
            onClick={onNext}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700 transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50"
          >
            ถัดไป
            <ChevronRight size={16} />
          </button>
        </section>
      </div>
    </AppShell>
  );
}
