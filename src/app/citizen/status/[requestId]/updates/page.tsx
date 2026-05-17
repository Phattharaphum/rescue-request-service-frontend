// src/app/citizen/status/[requestId]/updates/page.tsx
'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Info, KeyRound, MessageSquarePlus } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { CitizenUpdateForm } from '@/components/citizen/citizen-update-form';
import { CitizenUpdatesList } from '@/components/citizen/citizen-updates-list';
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
    <div className="space-y-5">
      {!trackingCodeFromQuery && (
        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-200 text-slate-950">
              <Info size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black tracking-normal text-amber-950">
                ต้องมีรหัสติดตามก่อนส่งข้อมูลเพิ่มเติม
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-amber-800">
                กรอกรหัสติดตามเพื่อดำเนินการต่อ หรือกลับไปหน้าค้นหาสถานะ
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Input
                  placeholder="กรอกรหัสติดตาม"
                  value={manualTrackingCode}
                  onChange={(event) => setManualTrackingCode(event.target.value)}
                />
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition-colors hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50"
                  onClick={applyTrackingCode}
                  disabled={!manualTrackingCode.trim()}
                >
                  <KeyRound size={17} />
                  ดำเนินการต่อ
                </button>
              </div>

              <Link
                href="/citizen/track"
                className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 text-sm font-black text-amber-800 transition-colors hover:bg-amber-100"
              >
                <ArrowLeft size={16} />
                กลับไปค้นหาสถานะ
              </Link>
            </div>
          </div>
        </section>
      )}

      {effectiveTrackingCode ? (
        <CitizenUpdateForm
          requestId={requestId}
          trackingCode={effectiveTrackingCode}
          onSuccess={() => setListVersion((value) => value + 1)}
        />
      ) : null}

      <CitizenUpdatesList key={`${requestId}-${listVersion}`} requestId={requestId} />
    </div>
  );
}

function UpdatesPageBody({ requestId }: { requestId: string }) {
  const searchParams = useSearchParams();
  const trackingCode = searchParams.get('trackingCode') ?? '';
  const statusHref = trackingCode
    ? `/citizen/status/${requestId}?trackingCode=${encodeURIComponent(trackingCode)}`
    : `/citizen/status/${requestId}`;

  return (
    <div className="mx-auto max-w-3xl space-y-5 py-6">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white">
        <div className="grid h-3 grid-cols-4">
          <span className="bg-amber-300" />
          <span className="bg-cyan-300" />
          <span className="bg-emerald-400" />
          <span className="bg-rose-500" />
        </div>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-black text-cyan-700">Citizen update</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
              ส่งข้อมูลเพิ่มเติม
            </h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              เพิ่มรายละเอียดสำคัญให้ทีมช่วยเหลือ เช่น ตำแหน่งล่าสุด จำนวนคน หรือข้อมูลติดต่อ
            </p>
          </div>

          <Link
            href={statusHref}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 transition-colors hover:bg-white sm:w-auto"
          >
            <ArrowLeft size={16} />
            กลับหน้าสถานะ
          </Link>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
            กำลังโหลด...
          </div>
        }
      >
        <UpdatesContent requestId={requestId} />
      </Suspense>

      <Link
        href={statusHref}
        className="group flex min-h-14 items-center justify-between gap-4 rounded-2xl bg-slate-950 px-5 py-4 text-white transition-colors hover:bg-slate-800 active:scale-[0.99]"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300 text-slate-950">
            <MessageSquarePlus size={20} />
          </span>
          <span className="text-sm font-black">กลับไปดูสถานะคำขอ</span>
        </span>
        <ArrowRight size={19} className="shrink-0 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

export default function CitizenUpdatesPage({ params }: PageProps) {
  const { requestId } = React.use(params);

  return (
    <AppShell variant="citizen">
      <UpdatesPageBody requestId={requestId} />
    </AppShell>
  );
}
