// src\app\staff\requests\[requestId]\edit\page.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { PatchRequestForm } from '@/components/staff/patch-request-form';
import { getRequestDetail } from '@/lib/api/rescue';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default function EditRequestPage({ params }: PageProps) {
  const { requestId } = React.use(params);
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['request-detail-edit', requestId],
    queryFn: () => getRequestDetail(requestId),
  });

  return (
    <AppShell variant="staff">
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          title="แก้ไขข้อมูลคำขอ"
          breadcrumbs={[
            { label: 'แผงควบคุม', href: '/admin/incident' },
            { label: 'คำขอ', href: `/admin/incident/requests/${requestId}` },
            { label: 'แก้ไข' },
          ]}
        />

        {isLoading && <LoadingState message="กำลังโหลดข้อมูล..." />}
        {error && <ErrorAlert message="ไม่สามารถโหลดข้อมูลคำขอได้" />}
        {data && (
          <PatchRequestForm
            requestId={requestId}
            currentData={data.master}
            stateVersion={data.currentState.stateVersion}
            onSuccess={() => router.push(`/admin/incident/requests/${requestId}`)}
          />
        )}
      </div>
    </AppShell>
  );
}
