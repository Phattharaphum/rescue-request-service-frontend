'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Info } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { CitizenUpdateForm } from '@/components/citizen/citizen-update-form';
import { CitizenUpdatesList } from '@/components/citizen/citizen-updates-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

function UpdatesContent({ requestId }: { requestId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackingCodeFromQuery = searchParams.get('trackingCode') ?? '';
  const [manualTrackingCode, setManualTrackingCode] = useState('');
  const [listVersion, setListVersion] = useState(0);

  const effectiveTrackingCode = (trackingCodeFromQuery || manualTrackingCode).trim();

  const applyTrackingCode = () => {
    const nextCode = manualTrackingCode.trim();
    if (!nextCode) return;

    const next = new URLSearchParams(searchParams.toString());
    next.set('trackingCode', nextCode);
    router.replace(`/citizen/status/${requestId}/updates?${next.toString()}`);
  };

  return (
    <div className="space-y-6">
      {!trackingCodeFromQuery && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Info size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="w-full space-y-3 text-sm text-amber-800">
            <p className="font-medium">ต้องมีรหัสติดตามก่อนจึงจะส่งข้อมูลเพิ่มเติมได้</p>
            <p>กรอกรหัสติดตามเพื่อดำเนินการต่อ หรือกลับไปหน้าค้นหาสถานะ</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="กรอกรหัสติดตาม"
                value={manualTrackingCode}
                onChange={(e) => setManualTrackingCode(e.target.value)}
              />
              <Button type="button" variant="primary" onClick={applyTrackingCode} disabled={!manualTrackingCode.trim()}>
                ดำเนินการต่อ
              </Button>
            </div>
            <Link href="/citizen/track" className="inline-block">
              <Button type="button" variant="outline">กลับไปค้นหาสถานะ</Button>
            </Link>
          </div>
        </div>
      )}

      {effectiveTrackingCode ? (
        <CitizenUpdateForm
          requestId={requestId}
          trackingCode={effectiveTrackingCode}
          onSuccess={() => setListVersion((v) => v + 1)}
        />
      ) : null}

      <CitizenUpdatesList key={`${requestId}-${listVersion}`} requestId={requestId} />
    </div>
  );
}

export default function CitizenUpdatesPage({ params }: PageProps) {
  const { requestId } = React.use(params);
  const searchParams = useSearchParams();
  const trackingCode = searchParams.get('trackingCode') ?? '';
  const statusHref = trackingCode
    ? `/citizen/status/${requestId}?trackingCode=${encodeURIComponent(trackingCode)}`
    : `/citizen/status/${requestId}`;

  return (
    <AppShell variant="citizen">
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title="ส่งข้อมูลเพิ่มเติม"
          breadcrumbs={[
            { label: 'หน้าหลัก', href: '/' },
            { label: 'สถานะคำขอ', href: statusHref },
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
