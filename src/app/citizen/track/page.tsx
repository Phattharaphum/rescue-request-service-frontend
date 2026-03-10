'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Info } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { TrackingLookupForm } from '@/components/citizen/tracking-lookup-form';

export default function CitizenTrackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestIdFromQuery = searchParams.get('requestId') ?? '';
  const trackingCodeFromQuery = searchParams.get('trackingCode') ?? '';

  useEffect(() => {
    if (!requestIdFromQuery || !trackingCodeFromQuery) return;

    const params = new URLSearchParams({ trackingCode: trackingCodeFromQuery });
    router.replace(`/citizen/status/${requestIdFromQuery}?${params.toString()}`);
  }, [requestIdFromQuery, trackingCodeFromQuery, router]);

  function handleFound(requestId: string, _incidentId: string, trackingCode: string) {
    const params = new URLSearchParams({ trackingCode });
    router.push(`/citizen/status/${requestId}?${params.toString()}`);
  }

  return (
    <AppShell variant="citizen">
      <div className="mx-auto max-w-lg space-y-6">
        <PageHeader
          title="ค้นหาสถานะคำขอ"
          breadcrumbs={[{ label: 'หน้าหลัก', href: '/' }, { label: 'ค้นหาสถานะคำขอ' }]}
        />

        <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <Info size={20} className="mt-0.5 shrink-0 text-blue-600" />
          <div className="space-y-1 text-sm text-blue-800">
            <p className="font-medium">ข้อมูลที่ต้องใช้ในการค้นหา</p>
            <ul className="list-inside list-disc space-y-1 text-blue-700">
              <li>เบอร์โทรศัพท์ที่ใช้ในการแจ้งคำขอ</li>
              <li>รหัสติดตาม (Tracking Code) ที่ได้รับหลังแจ้งคำขอ</li>
            </ul>
          </div>
        </div>

        <TrackingLookupForm onSuccess={handleFound} />
      </div>
    </AppShell>
  );
}
