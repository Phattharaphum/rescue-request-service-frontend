'use client';

import { Activity, Radio, Terminal } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { SnsEventStream } from '@/components/staff/sns-event-stream';
import { SNS_SSE_URL, SNS_STREAM_MODE, SNS_TOPIC_ARN } from '@/lib/config/env';

const streamCards = [
  {
    icon: Radio,
    label: 'Realtime channel',
    value: SNS_STREAM_MODE === 'sse' ? 'Server events' : 'Mock stream',
    tone: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  },
  {
    icon: Activity,
    label: 'Event monitor',
    value: 'ติดตามคำขอทุกจังหวะ',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    icon: Terminal,
    label: 'Payload viewer',
    value: 'เปิดดูข้อมูลดิบได้ทันที',
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
  },
];

export default function PubSubPage() {
  return (
    <AppShell variant="staff">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white">
          <div className="grid h-2 grid-cols-4">
            <div className="bg-cyan-400" />
            <div className="bg-emerald-400" />
            <div className="bg-amber-300" />
            <div className="bg-rose-400" />
          </div>

          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_390px] lg:p-8">
            <div className="flex min-w-0 flex-col justify-between gap-8">
              <div className="space-y-5">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Pub/Sub monitor
                </div>

                <div className="max-w-3xl space-y-3">
                  <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                    สตรีมเหตุการณ์
                  </h1>
                  <p className="text-base leading-8 text-slate-600 sm:text-lg">
                    ดูการไหลของเหตุการณ์จากระบบช่วยเหลือแบบเรียลไทม์ พร้อมกรองประเภทเหตุการณ์ เปิด payload และตรวจสอบ source ได้ในหน้าจอเดียว
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {streamCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className={`mb-4 inline-flex rounded-2xl border p-2 ${card.tone}`}>
                        <Icon size={18} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{card.label}</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{card.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-[26px] border border-slate-200 bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">SNS Topic</p>
                  <h2 className="mt-2 text-xl font-black">ช่องทางรับส่งข้อความ</h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-cyan-200">
                  <Radio size={22} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold text-slate-400">Topic ARN</p>
                  <p className="mt-2 break-all font-mono text-xs leading-6 text-cyan-100">{SNS_TOPIC_ARN}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-bold text-slate-400">Mode</p>
                    <p className="mt-2 text-sm font-black uppercase text-white">{SNS_STREAM_MODE}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-bold text-slate-400">Connection</p>
                    <p className="mt-2 text-sm font-black text-emerald-200">Live ready</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white p-3 sm:p-4">
          <SnsEventStream mode={SNS_STREAM_MODE} sseUrl={SNS_SSE_URL} />
        </section>
      </main>
    </AppShell>
  );
}
