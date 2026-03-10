'use client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { TrackingLookupForm } from '@/components/citizen/tracking-lookup-form';
import { Info } from 'lucide-react';

export default function CitizenTrackPage() {
  const router = useRouter();

  function handleFound(requestId: string, _incidentId: string) {
    router.push(`/citizen/status/${requestId}`);
  }

  return (
    <AppShell variant="citizen">
      <div className="max-w-lg mx-auto space-y-6">
        <PageHeader
          title="ค้นหาสถานะคำขอ"
          breadcrumbs={[{ label: 'หน้าหลัก', href: '/' }, { label: 'ค้นหาสถานะคำขอ' }]}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 space-y-1">
            <p className="font-medium">ข้อมูลที่ต้องใช้ในการค้นหา</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>เบอร์โทรศัพท์ที่ใช้ในการแจ้งคำขอ</li>
              <li>รหัสติดตาม (Tracking Code) ที่ได้รับหลังจากแจ้งคำขอ</li>
            </ul>
          </div>
        </div>

        <TrackingLookupForm onSuccess={handleFound} />
      </div>
    </AppShell>
  );
}
