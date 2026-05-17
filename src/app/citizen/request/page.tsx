// src/app/citizen/request/page.tsx
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardList, ShieldAlert } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { RescueRequestForm } from '@/components/citizen/rescue-request-form';
import { isSupportedRequestType } from '@/lib/config/request-types';

function CitizenRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestTypeParam = searchParams.get('requestType');
  const initialRequestType = isSupportedRequestType(requestTypeParam)
    ? requestTypeParam
    : undefined;

  function handleSuccess(data: {
    requestId: string;
    trackingCode: string;
    status: string;
    submittedAt: string;
  }) {
    const params = new URLSearchParams({
      requestId: data.requestId,
      trackingCode: data.trackingCode,
      status: data.status,
      submittedAt: data.submittedAt,
    });
    router.push(`/citizen/success?${params.toString()}`);
  }

  return (
    <AppShell variant="citizen">
      <div className="mx-auto max-w-4xl space-y-5 py-6">
        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white">
          <div className="grid h-3 grid-cols-4">
            <span className="bg-rose-500" />
            <span className="bg-amber-300" />
            <span className="bg-cyan-300" />
            <span className="bg-emerald-400" />
          </div>
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-black text-rose-700">
                <ShieldAlert size={16} />
                Emergency request
              </p>
              <h1 className="mt-5 text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                แจ้งขอความช่วยเหลือฉุกเฉิน
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500 sm:text-base">
                กรอกข้อมูลสถานการณ์ ตำแหน่ง และช่องทางติดต่อ เพื่อให้ทีมช่วยเหลือประเมินและประสานงานได้รวดเร็ว
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-500">Form steps</p>
                  <p className="text-lg font-black text-slate-950">3 ขั้นตอน</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <RescueRequestForm initialRequestType={initialRequestType} onSuccess={handleSuccess} />
      </div>
    </AppShell>
  );
}

export default function CitizenRequestPage() {
  return (
    <Suspense
      fallback={
        <AppShell variant="citizen">
          <div className="mx-auto max-w-4xl py-6">
            <div className="rounded-[30px] border border-slate-200 bg-white p-6">
              <p className="text-sm font-bold text-slate-500">กำลังโหลดแบบฟอร์ม...</p>
            </div>
          </div>
        </AppShell>
      }
    >
      <CitizenRequestContent />
    </Suspense>
  );
}
