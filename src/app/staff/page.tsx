'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Activity, ChevronRight, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { IncidentSelector } from '@/components/shared/incident-selector';
import { RequestsTable } from '@/components/staff/requests-table';
import { Button } from '@/components/ui/button';
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
  const { incidentId, setIncidentId } = useIncident();
  const [statusFilter, setStatusFilter] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [prevCursors, setPrevCursors] = useState<string[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['incident-requests-page', incidentId, statusFilter, cursor],
    queryFn: () =>
      listIncidentRequests(incidentId, {
        status: (statusFilter as RequestStatus) || undefined,
        cursor,
        limit: 20,
      }),
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
    setPrevCursors((p) => p.slice(0, -1));
    setCursor(prev === '' ? undefined : prev);
  };

  return (
    <AppShell variant="staff">
      <div className="space-y-6">
        <PageHeader
          title="แผงคำขอช่วยเหลือ"
          actions={
            <div className="flex gap-2">
              <Link href="/pubsub">
                <Button variant="outline" size="sm">
                  <Activity size={14} className="mr-1" /> Pub/Sub Events
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw size={14} className="mr-1" /> รีเฟรช
              </Button>
            </div>
          }
        />

        <IncidentSelector value={incidentId} onChange={onChangeIncident} />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChangeStatus('')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === ''
                ? 'bg-teal-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-teal-400'
            }`}
          >
            ทั้งหมด
          </button>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => onChangeStatus(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-teal-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-teal-400'
              }`}
            >
              {formatStatus(status)}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <RequestsTable items={items} isLoading={isLoading} />
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || prevCursors.length === 0}
            onClick={onPrev}
          >
            ← หน้าแรก
          </Button>
          {nextCursor && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-400">cursor: {nextCursor.slice(0, 20)}…</span>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={onNext}
              >
                ถัดไป <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
