// src/app/citizen/track/page.tsx
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Info } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { TrackingLookupForm } from '@/components/citizen/tracking-lookup-form';

function CitizenTrackPageContent() {
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
      <div className="mx-auto max-w-2xl space-y-8 py-6">
        <PageHeader
          title="ตรวจสอบสถานะคำขอ"
          breadcrumbs={[{ label: 'หน้าหลัก', href: '/' }, { label: 'ตรวจสอบสถานะ' }]}
        />

        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm">
          <Info size={24} className="mt-0.5 shrink-0 text-blue-600" />
          <div className="space-y-1.5 text-sm text-blue-900">
            <p className="font-bold text-base">ข้อมูลที่ต้องใช้ในการค้นหา</p>
            <ul className="list-inside list-disc space-y-1 text-blue-700 leading-relaxed">
              <li><span className="font-medium text-blue-800">เบอร์โทรศัพท์</span> ที่ระบุไว้ตอนแจ้งคำขอ</li>
              <li><span className="font-medium text-blue-800">รหัสติดตาม (Tracking Code)</span> ที่ได้รับหลังจากส่งคำขอสำเร็จ</li>
            </ul>
          </div>
        </div>

        <TrackingLookupForm onSuccess={handleFound} />
      </div>
    </AppShell>
  );
}

export default function CitizenTrackPage() {
  return (
    <Suspense 
      fallback={
        <AppShell variant="citizen">
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-gray-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-sm font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </AppShell>
      }
    >
      <CitizenTrackPageContent />
    </Suspense>
  );
}