'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/shared/copy-button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId') ?? '';
  const trackingCode = searchParams.get('trackingCode') ?? '';
  const status = searchParams.get('status') ?? '';
  const submittedAt = searchParams.get('submittedAt') ?? '';

  return (
    <AppShell variant="citizen">
      <div className="max-w-lg mx-auto py-10 space-y-6">
        <div className="text-center space-y-3">
          <CheckCircle size={64} className="text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">ส่งคำขอสำเร็จ</h1>
          <p className="text-gray-500">คำขอของคุณได้รับการบันทึกแล้ว</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
          <p className="text-sm text-green-700 font-medium">รหัสติดตามของคุณ</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-bold font-mono text-green-800 tracking-widest">{trackingCode}</span>
            <CopyButton text={trackingCode} />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">รหัสคำขอ</span>
            <span className="font-mono text-xs text-gray-700">{requestId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">สถานะ</span>
            <span className="text-teal-700 font-medium">{status}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">เวลาที่ส่ง</span>
            <span className="text-gray-700">{submittedAt ? new Date(submittedAt).toLocaleString('th-TH') : ''}</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">กรุณาเก็บรหัสติดตามและเบอร์โทรศัพท์ไว้ เพื่อตรวจสอบสถานะภายหลัง</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/citizen/track" className="flex-1">
            <Button className="w-full" variant="primary">ตรวจสอบสถานะ</Button>
          </Link>
          <Link href="/citizen/request" className="flex-1">
            <Button className="w-full" variant="outline">แจ้งคำขอใหม่</Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

export default function CitizenSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
