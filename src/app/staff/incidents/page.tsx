'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { IncidentSelector } from '@/components/shared/incident-selector';
import { RequestsTable } from '@/components/staff/requests-table';
import { Button } from '@/components/ui/button';
import { useIncident } from '@/lib/hooks/use-incident';
import { listIncidentRequests } from '@/lib/api/rescue';
import type { RequestStatus } from '@/types/rescue';
import { ChevronRight } from 'lucide-react';

const STATUS_OPTIONS = ['', 'SUBMITTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'];

export default function StaffIncidentsPage() {
  const { incidentId, setIncidentId } = useIncident();
  const [statusFilter, setStatusFilter] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['incident-requests-page', incidentId, statusFilter, cursor],
    queryFn: () => listIncidentRequests(incidentId, {
      status: (statusFilter as RequestStatus) || undefined,
      cursor,
      limit: 20,
    }),
    enabled: !!incidentId,
  });

  const items = data?.items ?? [];
  const nextCursor = data?.nextCursor;

  return (
    <AppShell variant="staff">
      <div className="space-y-6">
        <PageHeader
          title="รายการคำขอตาม Incident"
          breadcrumbs={[{ label: 'แผงควบคุม', href: '/staff' }, { label: 'รายการคำขอ' }]}
          actions={
            <Button variant="outline" size="sm" onClick={() => refetch()}>รีเฟรช</Button>
          }
        />

        <IncidentSelector value={incidentId} onChange={(v) => { setIncidentId(v); setCursor(undefined); }} />

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s || 'ALL'}
              onClick={() => { setStatusFilter(s); setCursor(undefined); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-400'
              }`}
            >
              {s || 'ทั้งหมด'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <RequestsTable items={items} isLoading={isLoading} />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={!cursor}
            onClick={() => setCursor(undefined)}
          >
            ← หน้าแรก
          </Button>
          {nextCursor && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">cursor: {nextCursor.slice(0, 20)}…</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCursor(nextCursor)}
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
