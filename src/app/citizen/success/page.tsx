// src/app/citizen/success/page.tsx
'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { CopyButton } from '@/components/shared/copy-button';

const TRACKING_REMINDER =
  'โปรดบันทึกหรือคัดลอก "รหัสติดตาม" ด้านล่างนี้ไว้ เพื่อใช้สำหรับตรวจสอบความคืบหน้าและแจ้งข้อมูลเพิ่มเติมให้เจ้าหน้าที่ทราบ';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId') ?? '';
  const trackingCode = searchParams.get('trackingCode') ?? '';
  const status = searchParams.get('status') ?? 'รอการตรวจสอบ';
  const submittedAt = searchParams.get('submittedAt') ?? '';

  const [isReminderOpen, setIsReminderOpen] = useState(true);
  const [isNavigationConfirmOpen, setIsNavigationConfirmOpen] = useState(false);
  const [nextHref, setNextHref] = useState('');

  const submittedAtText = useMemo(
    () => (submittedAt ? new Date(submittedAt).toLocaleString('th-TH') : ''),
    [submittedAt],
  );

  const trackHref = useMemo(() => {
    if (requestId && trackingCode) {
      const params = new URLSearchParams({ requestId, trackingCode });
      return `/citizen/track?${params.toString()}`;
    }
    return '/citizen/track';
  }, [requestId, trackingCode]);

  const updatesHref = useMemo(() => {
    if (requestId && trackingCode) {
      const params = new URLSearchParams({ trackingCode });
      return `/citizen/status/${requestId}/updates?${params.toString()}`;
    }
    return '/citizen/track';
  }, [requestId, trackingCode]);

  const requestNavigate = (href: string) => {
    setNextHref(href);
    setIsNavigationConfirmOpen(true);
  };

  const confirmNavigate = () => {
    if (!nextHref) return;
    setIsNavigationConfirmOpen(false);
    router.push(nextHref);
  };

  return (
    <AppShell variant="citizen">
      {/* Dialog เตือนให้บันทึกรหัส (ตอนเพิ่งโหลดหน้าเสร็จ) */}
      <Dialog
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        title="สำคัญ: โปรดบันทึกรหัสติดตาม"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm font-medium text-amber-800 leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-100">
            {TRACKING_REMINDER}
          </p>
          <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-5 text-center shadow-sm">
            <p className="text-sm font-medium text-blue-700">รหัสติดตามของคุณคือ</p>
            <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-blue-900">{trackingCode || '-'}</p>
          </div>
          <Button className="w-full" size="lg" variant="primary" onClick={() => setIsReminderOpen(false)}>
            รับทราบและบันทึกแล้ว
          </Button>
        </div>
      </Dialog>

      {/* Dialog ยืนยันก่อนเปลี่ยนหน้า */}
      <Dialog
        isOpen={isNavigationConfirmOpen}
        onClose={() => setIsNavigationConfirmOpen(false)}
        title="ยืนยันการเปลี่ยนหน้า"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-600">
            คุณได้บันทึกรหัสติดตาม <span className="font-mono font-bold text-gray-900">{trackingCode}</span> ไว้แล้วใช่หรือไม่?
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button className="flex-1" variant="outline" onClick={() => setIsNavigationConfirmOpen(false)}>
              กลับไปคัดลอก
            </Button>
            <Button className="flex-1" variant="primary" onClick={confirmNavigate}>
              ยืนยันและไปต่อ
            </Button>
          </div>
        </div>
      </Dialog>

      <div className="mx-auto max-w-lg space-y-8 py-8 sm:py-12">
        {/* Success Header */}
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-inner">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">ส่งคำขอความช่วยเหลือสำเร็จ</h1>
            <p className="text-base text-gray-500">ระบบได้รับข้อมูลของคุณเรียบร้อยแล้ว ทีมงานกำลังเร่งดำเนินการ</p>
          </div>
        </div>

        {/* Tracking Code Highlight */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-blue-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
          <p className="text-center text-sm font-bold text-blue-600 uppercase tracking-wider">รหัสติดตามของคุณ</p>
          <div className="mt-3 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <span className="font-mono text-4xl font-black tracking-[0.2em] text-gray-900 drop-shadow-sm">
              {trackingCode}
            </span>
            <CopyButton text={trackingCode} className="sm:ml-2 bg-blue-50 hover:bg-blue-100" />
          </div>
          <div className="mt-6 rounded-xl bg-amber-50/80 p-4 border border-amber-100 flex gap-3 items-start">
            <AlertTriangle size={20} className="shrink-0 text-amber-600 mt-0.5" />
            <p className="text-sm font-medium text-amber-800 leading-relaxed">{TRACKING_REMINDER}</p>
          </div>
        </div>

        {/* Summary Details */}
        <div className="rounded-2xl border border-gray-100 bg-white p-1">
          <ul className="divide-y divide-gray-50 text-sm">
            <li className="flex items-center justify-between p-4">
              <span className="text-gray-500">รหัสอ้างอิงระบบ (Request ID)</span>
              <span className="font-mono text-xs font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{requestId || '-'}</span>
            </li>
            <li className="flex items-center justify-between p-4">
              <span className="text-gray-500">สถานะปัจจุบัน</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                <ShieldCheck size={14} />
                {status || '-'}
              </span>
            </li>
            <li className="flex items-center justify-between p-4">
              <span className="text-gray-500">เวลาที่ส่งคำขอ</span>
              <span className="font-medium text-gray-900">{submittedAtText || '-'}</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row pt-2">
          <Button 
            className="flex-1 rounded-xl shadow-sm" 
            size="lg" 
            variant="primary" 
            onClick={() => requestNavigate(trackHref)}
          >
            ตรวจสอบสถานะคำขอ
          </Button>
          <Button 
            className="flex-1 rounded-xl bg-white" 
            size="lg" 
            variant="outline" 
            onClick={() => requestNavigate(updatesHref)}
            rightIcon={<ArrowRight size={16} />}
          >
            แจ้งรายละเอียดเพิ่มเติม
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

export default function CitizenSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-gray-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <p className="text-sm font-medium">กำลังโหลดข้อมูล...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}