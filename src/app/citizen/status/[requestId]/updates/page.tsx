'use client';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { CitizenUpdateForm } from '@/components/citizen/citizen-update-form';
import { CitizenUpdatesList } from '@/components/citizen/citizen-updates-list';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

function UpdatesContent({ requestId }: { requestId: string }) {
  const searchParams = useSearchParams();
  const trackingCode = searchParams.get('trackingCode') ?? '';

  if (!trackingCode) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">ต้องการรหัสติดตาม</p>
            <p>กรุณาระบุรหัสติดตาม (Tracking Code) เพื่อส่งข้อมูลเพิ่มเติม</p>
          </div>
        </div>
        <Link href="/citizen/track">
          <Button variant="primary">กลับไปค้นหา</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CitizenUpdateForm requestId={requestId} trackingCode={trackingCode} />
      <CitizenUpdatesList requestId={requestId} />
    </div>
  );
}

export default function CitizenUpdatesPage({ params }: PageProps) {
  const { requestId } = React.use(params);

  return (
    <AppShell variant="citizen">
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          title="ส่งข้อมูลเพิ่มเติม"
          breadcrumbs={[
            { label: 'หน้าหลัก', href: '/' },
            { label: 'สถานะ', href: `/citizen/status/${requestId}` },
            { label: 'ส่งข้อมูลเพิ่มเติม' },
          ]}
        />
        <Suspense fallback={<div>กำลังโหลด...</div>}>
          <UpdatesContent requestId={requestId} />
        </Suspense>
      </div>
    </AppShell>
  );
}
