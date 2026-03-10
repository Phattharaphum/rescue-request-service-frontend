'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { CopyButton } from '@/components/shared/copy-button';

const TRACKING_REMINDER =
  'กรุณาจดจำหรือบันทึก รหัสติดตาม ไว้เพื่อใช้ในการติดตามความคืบหน้า และแจ้งอัพเดทเพิ่มเติม';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId') ?? '';
  const trackingCode = searchParams.get('trackingCode') ?? '';
  const status = searchParams.get('status') ?? '';
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
      <Dialog
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        title="สำคัญ: บันทึกรหัสติดตาม"
      >
        <div className="space-y-4">
          <p className="text-sm font-medium text-amber-800">{TRACKING_REMINDER}</p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-xs text-amber-700">รหัสติดตาม</p>
            <p className="mt-1 font-mono text-xl font-bold tracking-widest text-amber-900">{trackingCode || '-'}</p>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="primary" onClick={() => setIsReminderOpen(false)}>
              รับทราบ
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={isNavigationConfirmOpen}
        onClose={() => setIsNavigationConfirmOpen(false)}
        title="ยืนยันก่อนเปลี่ยนหน้า"
      >
        <div className="space-y-4">
          <p className="text-sm font-medium text-amber-800">{TRACKING_REMINDER}</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsNavigationConfirmOpen(false)}>
              กลับไปก่อน
            </Button>
            <Button type="button" variant="primary" onClick={confirmNavigate}>
              ยืนยันและไปต่อ
            </Button>
          </div>
        </div>
      </Dialog>

      <div className="mx-auto max-w-lg space-y-6 py-10">
        <div className="space-y-3 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900">ส่งคำขอสำเร็จ</h1>
          <p className="text-gray-500">คำขอของคุณได้รับการบันทึกแล้ว</p>
        </div>

        <div className="space-y-2 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-sm font-medium text-green-700">รหัสติดตามของคุณ</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-3xl font-bold tracking-widest text-green-800">{trackingCode}</span>
            <CopyButton text={trackingCode} />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">รหัสคำขอ</span>
            <span className="font-mono text-xs text-gray-700">{requestId || '-'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">สถานะ</span>
            <span className="font-medium text-teal-700">{status || '-'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">เวลาที่ส่ง</span>
            <span className="text-gray-700">{submittedAtText || '-'}</span>
          </div>
        </div>

        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-amber-800">{TRACKING_REMINDER}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" variant="primary" onClick={() => requestNavigate(trackHref)}>
            ตรวจสอบสถานะ
          </Button>
          <Button className="flex-1" variant="outline" onClick={() => requestNavigate(updatesHref)}>
            แจ้งรายละเอียดเพิ่มเติม
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

export default function CitizenSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">กำลังโหลด...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
