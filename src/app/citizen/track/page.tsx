// src/app/citizen/track/page.tsx
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardCheck, SearchCheck } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
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
      <div className="mx-auto max-w-3xl space-y-5 py-6">
        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white">
          <div className="grid h-3 grid-cols-4">
            <span className="bg-cyan-300" />
            <span className="bg-blue-500" />
            <span className="bg-amber-300" />
            <span className="bg-emerald-400" />
          </div>
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-black text-blue-700">
                <SearchCheck size={16} />
                Request tracking
              </p>
              <h1 className="mt-5 text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                ตรวจสอบสถานะคำขอ
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500 sm:text-base">
                ใช้เบอร์โทรศัพท์ที่แจ้งไว้พร้อมรหัสติดตาม 6 หลัก เพื่อตรวจสอบความคืบหน้าล่าสุด
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <ClipboardCheck size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-500">Required</p>
                  <p className="text-lg font-black text-slate-950">2 ข้อมูล</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <section className="rounded-[28px] border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Info size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-normal text-blue-950">
                ข้อมูลที่ต้องใช้ในการค้นหา
              </h2>
              <div className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-blue-800 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-200 bg-white p-3">
                  <Phone size={17} className="mb-2 text-blue-700" />
                  เบอร์โทรศัพท์ที่ระบุไว้ตอนแจ้งคำขอ
                </div>
                <div className="rounded-2xl border border-blue-200 bg-white p-3">
                  <KeyRound size={17} className="mb-2 text-blue-700" />
                  รหัสติดตามตัวเลข 6 หลัก
                </div>
              </div>
            </div>
          </div>
        </section> */}

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
          <div className="mx-auto max-w-3xl py-6">
            <div className="rounded-[30px] border border-slate-200 bg-white p-6">
              <p className="text-sm font-bold text-slate-500">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </AppShell>
      }
    >
      <CitizenTrackPageContent />
    </Suspense>
  );
}
