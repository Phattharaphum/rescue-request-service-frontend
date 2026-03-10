'use client';
import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { EventsList } from '@/components/staff/events-list';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default function RequestEventsPage({ params }: PageProps) {
  const { requestId } = React.use(params);
  const router = useRouter();

  return (
    <AppShell variant="staff">
      <div className="space-y-6">
        <PageHeader
          title="ประวัติสถานะ"
          breadcrumbs={[
            { label: 'แผงควบคุม', href: '/staff' },
            { label: 'คำขอ', href: `/staff/requests/${requestId}` },
            { label: 'ประวัติสถานะ' },
          ]}
          actions={
            <Button variant="outline" size="sm" onClick={() => router.refresh()}>รีเฟรช</Button>
          }
        />

        <div className="bg-white rounded-xl border shadow-sm p-4">
          <EventsList requestId={requestId} />
        </div>
      </div>
    </AppShell>
  );
}
