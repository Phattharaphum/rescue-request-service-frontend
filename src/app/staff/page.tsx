// src/app/staff/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Activity, ChevronLeft, ChevronRight, RefreshCw, Filter } from 'lucide-react';
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
  const { incidentId, setIncidentId, incidents, isLoadingIncidents } = useIncident();
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
          title="แดชบอร์ดจัดการคำขอช่วยเหลือ"
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/admin/pubsub">
                <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                  <Activity size={16} className="text-blue-600" />
                  <span className="hidden sm:inline">สตรีมข้อมูล (Pub/Sub)</span>
                </Button>
              </Link>
              <Button variant="primary" size="sm" onClick={() => refetch()} className="shadow-sm">
                <RefreshCw size={16} />
                <span className="hidden sm:inline">รีเฟรชข้อมูล</span>
              </Button>
            </div>
          }
        />

        {/* Filters Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <div className="w-full sm:w-72">
              <IncidentSelector
                value={incidentId}
                onChange={onChangeIncident}
                incidents={incidents}
                isLoading={isLoadingIncidents}
              />
            </div>
            
            <div className="flex-1 space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <Filter size={14} className="text-gray-400" />
                กรองตามสถานะคำขอ
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onChangeStatus('')}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-sm ${
                    statusFilter === ''
                      ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-1'
                      : 'border border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  ทั้งหมด
                </button>
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => onChangeStatus(status)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-sm ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-1'
                        : 'border border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {formatStatus(status)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <RequestsTable items={items} isLoading={isLoading} />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 border border-gray-200 shadow-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || prevCursors.length === 0}
            onClick={onPrev}
            leftIcon={<ChevronLeft size={16} />}
            className="rounded-xl border-gray-300 hover:bg-gray-50"
          >
            ก่อนหน้า
          </Button>
          
          <div className="text-sm font-medium text-gray-500">
            {isLoading ? 'กำลังโหลด...' : `รายการที่ ${(prevCursors.length * 20) + 1} - ${(prevCursors.length * 20) + items.length}`}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || !nextCursor}
            onClick={onNext}
            rightIcon={<ChevronRight size={16} />}
            className="rounded-xl border-gray-300 hover:bg-gray-50"
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
