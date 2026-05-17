import Link from 'next/link';
import {
  ArrowRight,
  Code2,
  Cross,
  LocateFixed,
  MapPinned,
  PackageOpen,
  Route,
  SearchCheck,
  ShieldCheck,
  Siren,
  Stethoscope,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { REQUEST_TYPE_OPTIONS, type SupportedRequestType } from '@/lib/config/request-types';

const TEXT = {
  title: 'ระบบจัดการคำขอช่วยเหลือผู้ประสบภัย',
  name: 'ภัทรภูมิ กิ่งชัย',
  studentId: 'รหัสนักศึกษา 6609612160',
};

const REQUEST_TYPE_META: Record<
  SupportedRequestType,
  {
    icon: typeof Stethoscope;
    card: string;
    tile: string;
    label: string;
    description: string;
  }
> = {
  MEDICAL: {
    icon: Stethoscope,
    card: 'border-rose-200 bg-rose-50 hover:bg-rose-100',
    tile: 'bg-rose-500 text-white',
    label: 'MED',
    description: 'ผู้ป่วยฉุกเฉิน ยา เวชภัณฑ์ หรือความเสี่ยงด้านสุขภาพ',
  },
  EVACUATION: {
    icon: Route,
    card: 'border-amber-200 bg-amber-50 hover:bg-amber-100',
    tile: 'bg-amber-400 text-slate-950',
    label: 'MOVE',
    description: 'ติดค้าง ต้องอพยพ หรือเคลื่อนย้ายออกจากพื้นที่เสี่ยง',
  },
  SUPPLY: {
    icon: PackageOpen,
    card: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
    tile: 'bg-emerald-500 text-white',
    label: 'SUP',
    description: 'อาหาร น้ำดื่ม และเสบียงจำเป็นสำหรับผู้ประสบภัย',
  },
};

const QUICK_ACTIONS = [
  {
    href: '/citizen/track',
    icon: SearchCheck,
    title: 'ติดตามสถานะ',
    description: 'ตรวจความคืบหน้าด้วยรหัสติดตาม',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    href: '/admin/login',
    icon: ShieldCheck,
    title: 'ผู้ดูแลระบบ',
    description: 'จัดการคำขอและสถานการณ์',
    className: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  {
    href: '/developer',
    icon: Code2,
    title: 'Developer',
    description: 'API และเครื่องมือระบบ',
    className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl">
        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white">
          <div className="grid min-h-[620px] lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.7fr)]">
            <div className="relative flex flex-col justify-between overflow-hidden bg-slate-950 p-5 text-white sm:p-8 lg:p-10">
              <div className="absolute left-0 top-0 h-3 w-full grid-cols-4 grid">
                <div className="bg-rose-500" />
                <div className="bg-amber-300" />
                <div className="bg-cyan-300" />
                <div className="bg-emerald-400" />
              </div>

              <div className="absolute -right-28 top-14 hidden h-52 w-52 rounded-full border-[34px] border-cyan-300/10 lg:block" />
              <div className="absolute bottom-0 right-0 grid h-44 w-44 grid-cols-4 grid-rows-4 opacity-20">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span key={index} className="border border-white/20" />
                ))}
              </div>

              <div className="relative z-10">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-bold text-cyan-100">
                  <Siren size={16} />
                  Rescue Request Command
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-normal text-white sm:text-6xl lg:text-7xl">
                  {TEXT.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-300 sm:text-lg">
                  แจ้งเหตุ ติดตามสถานะ และประสานงานช่วยเหลือ
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/citizen/request"
                    className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-amber-300 px-6 text-base font-black text-slate-950 transition-colors hover:bg-amber-200 active:scale-[0.99]"
                  >
                    แจ้งขอความช่วยเหลือ
                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/citizen/track"
                    className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-6 text-base font-black text-white transition-colors hover:bg-white/15 active:scale-[0.99]"
                  >
                    <SearchCheck size={20} />
                    ติดตามคำขอ
                  </Link>
                </div>
              </div>

              <div className="relative z-10 mt-10 grid gap-3 sm:grid-cols-3">
                {REQUEST_TYPE_OPTIONS.map((option) => {
                  const meta = REQUEST_TYPE_META[option.value];
                  const Icon = meta.icon;

                  return (
                    <Link
                      key={option.value}
                      href={`/citizen/request?requestType=${option.value}`}
                      className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition-colors hover:bg-white/[0.1] active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${meta.tile}`}
                        >
                          <Icon size={24} />
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-black text-slate-300">
                          {meta.label}
                        </span>
                      </div>
                      <h2 className="mt-5 text-lg font-black text-white">{option.shortLabel}</h2>
                      <p className="mt-1 text-sm font-bold leading-6 text-slate-300">
                        {option.label}
                      </p>
                      <p className="mt-3 text-xs font-semibold leading-5 text-slate-400">
                        {meta.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <aside className="relative overflow-hidden bg-slate-50 p-5 sm:p-8 lg:p-7">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
              <div className="relative flex h-full flex-col gap-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      
                      <h2 className="mt-2 text-2xl font-black tracking-normal text-slate-950">
                        เมนูลัด
                      </h2>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <LocateFixed size={24} />
                    </div>
                  </div>
                </div>

                <div className="relative min-h-64 flex-1 rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="absolute left-8 top-8 h-20 w-20 rounded-full border-[14px] border-rose-100" />
                  <div className="absolute bottom-12 right-8 h-24 w-24 rounded-[28px] bg-cyan-100" />
                  <div className="absolute right-20 top-24 h-16 w-16 rounded-full bg-amber-200" />
                  <div className="absolute bottom-24 left-12 h-12 w-28 rounded-full bg-emerald-100" />
                  <div className="relative flex h-full min-h-64 flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700">
                        <Cross size={14} />
                        ACTIVE
                      </span>
                      <span className="text-xs font-black text-slate-400">ZONE 01</span>
                    </div>
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[18px] border-slate-950 bg-white text-slate-950">
                      <MapPinned size={42} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-3 rounded-full bg-rose-400" />
                      <div className="h-3 rounded-full bg-amber-300" />
                      <div className="h-3 rounded-full bg-cyan-300" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;

                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        className={`group flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition-colors hover:bg-white active:scale-[0.99] ${action.className}`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-current">
                            <Icon size={22} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-black text-slate-950">
                              {action.title}
                            </span>
                            <span className="mt-0.5 block text-xs font-semibold leading-5 text-slate-500">
                              {action.description}
                            </span>
                          </span>
                        </span>
                        <ArrowRight
                          size={19}
                          className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
