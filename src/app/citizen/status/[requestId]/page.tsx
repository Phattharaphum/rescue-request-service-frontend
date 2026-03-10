'use client';
import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { CitizenStatusCard } from '@/components/citizen/citizen-status-card';
import { Button } from '@/components/ui/button';
import { getCitizenStatus } from '@/lib/api/rescue';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default function CitizenStatusPage({ params }: PageProps) {
  const { requestId } = React.use(params);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['citizen-status', requestId],
    queryFn: () => getCitizenStatus(requestId),
    refetchInterval: 30000,
  });

  return (
    <AppShell variant="citizen">
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          title="สถานะคำขอช่วยเหลือ"
          breadcrumbs={[
            { label: 'หน้าหลัก', href: '/' },
            { label: 'ค้นหาสถานะ', href: '/citizen/track' },
            { label: 'สถานะ' },
          ]}
          actions={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              รีเฟรช
            </Button>
          }
        />

        {isLoading && <LoadingState message="กำลังโหลดสถานะ..." />}
        {error && <ErrorAlert message="ไม่สามารถโหลดสถานะได้" />}
        {data && <CitizenStatusCard data={data} />}

        {data && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/citizen/status/${requestId}/updates`} className="flex-1">
              <Button className="w-full" variant="primary">ส่งข้อมูลเพิ่มเติม</Button>
            </Link>
            <Link href="/citizen/track" className="flex-1">
              <Button className="w-full" variant="outline">ค้นหาคำขออื่น</Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
