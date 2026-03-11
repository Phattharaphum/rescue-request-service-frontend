// src\app\staff\requests\[requestId]\current\page.tsx
'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { CurrentStateCard } from '@/components/staff/current-state-card';
import { JsonViewer } from '@/components/shared/json-viewer';
import { Button } from '@/components/ui/button';
import { getCurrentState } from '@/lib/api/rescue';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default function CurrentStatePage({ params }: PageProps) {
  const { requestId } = React.use(params);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['current-state', requestId],
    queryFn: () => getCurrentState(requestId),
    refetchInterval: 15000,
  });

  return (
    <AppShell variant="staff">
      <div className="space-y-6">
        <PageHeader
          title="สถานะปัจจุบัน"
          breadcrumbs={[
            { label: 'แผงควบคุม', href: '/staff' },
            { label: 'คำขอ', href: `/staff/requests/${requestId}` },
            { label: 'สถานะปัจจุบัน' },
          ]}
          actions={
            <Button variant="outline" size="sm" onClick={() => refetch()}>รีเฟรช</Button>
          }
        />

        {isLoading && <LoadingState message="กำลังโหลดสถานะ..." />}
        {error && <ErrorAlert message="ไม่สามารถโหลดสถานะปัจจุบันได้" />}
        {data && (
          <div className="space-y-6">
            <CurrentStateCard state={data} />
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">ข้อมูล JSON</h3>
              <JsonViewer data={data} />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
