'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Activity } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { IncidentSelector } from '@/components/shared/incident-selector';
import { RequestsTable } from '@/components/staff/requests-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { useIncident } from '@/lib/hooks/use-incident';
import { listIncidentRequests } from '@/lib/api/rescue';
import type { RequestStatus } from '@/types/rescue';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'ทั้งหมด', value: '' },
  { label: 'SUBMITTED', value: 'SUBMITTED' },
  { label: 'TRIAGED', value: 'TRIAGED' },
  { label: 'ASSIGNED', value: 'ASSIGNED' },
  { label: 'IN_PROGRESS', value: 'IN_PROGRESS' },
  { label: 'RESOLVED', value: 'RESOLVED' },
  { label: 'CANCELLED', value: 'CANCELLED' },
];

const ALL_STATUSES: RequestStatus[] = ['SUBMITTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'];

export default function StaffDashboardPage() {
  const { incidentId, setIncidentId } = useIncident();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['incident-requests', incidentId, statusFilter],
    queryFn: () => listIncidentRequests(incidentId, {
      status: (statusFilter as RequestStatus) || undefined,
      limit: 50,
    }),
    enabled: !!incidentId,
  });

  const items = data?.items ?? [];

  const countByStatus = ALL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = items.filter((i) => i.status === s).length;
    return acc;
  }, {});

  return (
    <AppShell variant="staff">
      <div className="space-y-6">
        <PageHeader
          title="แผงควบคุมเจ้าหน้าที่"
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

        <IncidentSelector value={incidentId} onChange={setIncidentId} />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ALL_STATUSES.map((status) => (
            <div key={status} className="bg-white rounded-xl border p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{countByStatus[status]}</p>
              <StatusBadge status={status} />
            </div>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <RequestsTable items={items} isLoading={isLoading} />
        </div>
      </div>
    </AppShell>
  );
}
