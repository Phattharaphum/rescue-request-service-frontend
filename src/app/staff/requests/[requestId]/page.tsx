'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Edit, Clock, Key } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { JsonViewer } from '@/components/shared/json-viewer';
import { RequestMasterCard } from '@/components/staff/request-master-card';
import { CurrentStateCard } from '@/components/staff/current-state-card';
import { StateActionPanel } from '@/components/staff/state-action-panel';
import { EventsList } from '@/components/staff/events-list';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { getRequestDetail } from '@/lib/api/rescue';
import { formatDateTime } from '@/lib/utils/date';
import { formatUpdateType } from '@/lib/utils/format';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default function RequestDetailPage({ params }: PageProps) {
  const { requestId } = React.use(params);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['request-detail', requestId],
    queryFn: () => getRequestDetail(requestId, { includeEvents: true, includeCitizenUpdates: true }),
  });

  const updateItems = data?.updateItems ?? data?.citizenUpdates ?? [];

  return (
    <AppShell variant="staff">
      <div className="space-y-6">
        <PageHeader
          title="รายละเอียดคำขอ"
          breadcrumbs={[
            { label: 'แผงควบคุม', href: '/staff' },
            { label: 'คำขอ', href: '/staff' },
            { label: requestId.slice(0, 8) + '...' },
          ]}
          actions={
            <div className="flex gap-2">
              <Link href={`/staff/requests/${requestId}/edit`}>
                <Button variant="outline" size="sm"><Edit size={14} className="mr-1" />แก้ไข</Button>
              </Link>
              <Link href={`/staff/requests/${requestId}/events`}>
                <Button variant="outline" size="sm"><Clock size={14} className="mr-1" />ประวัติ</Button>
              </Link>
              <Link href={`/staff/requests/${requestId}/idempotency`}>
                <Button variant="outline" size="sm"><Key size={14} className="mr-1" />Idempotency</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => refetch()}>รีเฟรช</Button>
            </div>
          }
        />

        {isLoading && <LoadingState message="กำลังโหลดข้อมูล..." />}
        {error && <ErrorAlert message="ไม่สามารถโหลดข้อมูลคำขอได้" />}

        {data && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RequestMasterCard master={data.master} requestId={requestId} />
              <div className="space-y-4">
                <CurrentStateCard state={data.currentState} />
                <StateActionPanel
                  requestId={requestId}
                  status={data.currentState.status}
                  stateVersion={data.currentState.stateVersion}
                  onSuccess={() => refetch()}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-4">ประวัติสถานะ</h3>
              <EventsList requestId={requestId} />
            </div>

            <Card>
              <CardHeader title="updateItems จากผู้แจ้ง" />
              <CardContent>
                {updateItems.length === 0 ? (
                  <p className="text-sm text-gray-500">ยังไม่มี citizen updates</p>
                ) : (
                  <div className="space-y-3">
                    {updateItems.map((item) => (
                      <div key={item.updateId} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="blue" size="sm">
                            {formatUpdateType(item.updateType)}
                          </Badge>
                          <span className="text-xs text-gray-500">{item.updateId}</span>
                          <span className="ml-auto text-xs text-gray-500">{formatDateTime(item.createdAt)}</span>
                        </div>
                        <JsonViewer data={item.updatePayload} collapsed />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
