// src/app/citizen/success/page.tsx
'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  MessageSquarePlus,
  SearchCheck,
  ShieldCheck,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Dialog } from '@/components/ui/dialog';
import { CopyButton } from '@/components/shared/copy-button';

const TRACKING_REMINDER =
  'โปรดบันทึกหรือคัดลอก "รหัสติดตาม" นี้ไว้ เพื่อใช้ตรวจสอบความคืบหน้าและแจ้งข้อมูลเพิ่มเติมให้เจ้าหน้าที่ทราบ';

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
      <Dialog
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        title="สำคัญ: โปรดบันทึกรหัสติดตาม"
        size="sm"
      >
        <div className="space-y-5">
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
            {TRACKING_REMINDER}
          </p>
          <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50 p-5 text-center">
            <p className="text-sm font-black text-blue-700">รหัสติดตามของคุณคือ</p>
            <p className="mt-2 break-all font-mono text-3xl font-black tracking-widest text-blue-950">
              {trackingCode || '-'}
            </p>
          </div>
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition-colors hover:bg-slate-800"
            onClick={() => setIsReminderOpen(false)}
          >
            รับทราบและบันทึกแล้ว
          </button>
        </div>
      </Dialog>

      <Dialog
        isOpen={isNavigationConfirmOpen}
        onClose={() => setIsNavigationConfirmOpen(false)}
        title="ยืนยันการเปลี่ยนหน้า"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm font-semibold leading-6 text-slate-600">
            คุณได้บันทึกรหัสติดตาม{' '}
            <span className="font-mono font-black text-slate-950">{trackingCode || '-'}</span>{' '}
            ไว้แล้วใช่หรือไม่?
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => setIsNavigationConfirmOpen(false)}
            >
              กลับไปคัดลอก
            </button>
            <button
              type="button"
              className="flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition-colors hover:bg-slate-800"
              onClick={confirmNavigate}
            >
              ยืนยันและไปต่อ
            </button>
          </div>
        </div>
      </Dialog>

      <div className="mx-auto max-w-2xl py-6 sm:py-10">
        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white">
          <div className="grid h-3 grid-cols-4">
            <span className="bg-emerald-400" />
            <span className="bg-cyan-300" />
            <span className="bg-amber-300" />
            <span className="bg-rose-500" />
          </div>

          <div className="p-5 sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-emerald-200 bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={42} />
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
                ส่งคำขอสำเร็จ
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-6 text-slate-500 sm:text-base">
                ระบบได้รับข้อมูลของคุณเรียบร้อยแล้ว ทีมงานกำลังเร่งดำเนินการ
              </p>
            </div>

            <div className="mt-7 rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-black text-blue-700">รหัสติดตามของคุณ</p>
                  <p className="mt-2 break-all font-mono text-3xl font-black tracking-[0.18em] text-slate-950 sm:text-4xl">
                    {trackingCode || '-'}
                  </p>
                </div>
                <CopyButton
                  text={trackingCode}
                  className="h-11 shrink-0 rounded-2xl border border-blue-200 bg-white px-4 font-black hover:bg-blue-50"
                />
              </div>

              <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-sm font-semibold leading-6 text-amber-800">
                  {TRACKING_REMINDER}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-2">
              <ul className="grid gap-2 text-sm">
                <li className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-bold text-slate-500">รหัสอ้างอิงระบบ</span>
                  <span className="break-all rounded-xl bg-slate-100 px-3 py-1.5 font-mono text-xs font-bold text-slate-900">
                    {requestId || '-'}
                  </span>
                </li>
                <li className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-bold text-slate-500">สถานะปัจจุบัน</span>
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 font-black text-blue-700">
                    <ShieldCheck size={14} />
                    {status || '-'}
                  </span>
                </li>
                <li className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-bold text-slate-500">เวลาที่ส่งคำขอ</span>
                  <span className="font-bold text-slate-900">{submittedAtText || '-'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="group flex min-h-16 items-center justify-between gap-4 rounded-2xl bg-slate-950 px-5 py-4 text-left text-white transition-colors hover:bg-slate-800 active:scale-[0.99]"
                onClick={() => requestNavigate(trackHref)}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-300 text-slate-950">
                    <SearchCheck size={22} />
                  </span>
                  <span className="text-sm font-black">ตรวจสอบสถานะคำขอ</span>
                </span>
                <ArrowRight size={19} className="shrink-0 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                className="group flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-slate-950 transition-colors hover:bg-slate-50 active:scale-[0.99]"
                onClick={() => requestNavigate(updatesHref)}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-slate-950">
                    <MessageSquarePlus size={22} />
                  </span>
                  <span className="text-sm font-black">แจ้งรายละเอียดเพิ่มเติม</span>
                </span>
                <ArrowRight
                  size={19}
                  className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function CitizenSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-slate-500">
          <ClipboardCheck size={34} className="animate-pulse text-cyan-600" />
          <p className="text-sm font-bold">กำลังโหลดข้อมูล...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
