import Link from 'next/link';
import {
  ArrowRight,
  Code2,
  PackageOpen,
  Route,
  SearchCheck,
  ShieldAlert,
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
    accent: string;
    iconClass: string;
    description: string;
  }
> = {
  MEDICAL: {
    icon: Stethoscope,
    accent: 'border-rose-200 bg-rose-50 hover:border-rose-300 hover:bg-rose-100/70',
    iconClass: 'bg-rose-600 text-white',
    description: 'เหมาะสำหรับผู้ป่วยฉุกเฉิน ยา เวชภัณฑ์ หรือความเสี่ยงด้านสุขภาพ',
  },
  EVACUATION: {
    icon: Route,
    accent: 'border-amber-200 bg-amber-50 hover:border-amber-300 hover:bg-amber-100/70',
    iconClass: 'bg-amber-600 text-white',
    description: 'ขอช่วยออกจากพื้นที่ ติดค้าง หรือจำเป็นต้องเคลื่อนย้ายเร่งด่วน',
  },
  SUPPLY: {
    icon: PackageOpen,
    accent: 'border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100/70',
    iconClass: 'bg-emerald-600 text-white',
    description: 'แจ้งความต้องการอาหาร น้ำดื่ม และเสบียงจำเป็นสำหรับผู้ประสบภัย',
  },
};

export default function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-0">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1fr_0.9fr]">
            <div className="flex min-h-[420px] flex-col justify-between p-7 sm:p-10">
              <div>
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                  <ShieldAlert size={16} />
                  ระบบช่วยเหลือฉุกเฉิน
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                    {TEXT.title}
                  </h1>
                  <p className="text-base font-semibold text-slate-600 sm:text-lg">
                    {TEXT.name} · {TEXT.studentId}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {REQUEST_TYPE_OPTIONS.map((option) => {
                  const meta = REQUEST_TYPE_META[option.value];
                  const Icon = meta.icon;

                  return (
                    <Link
                      key={option.value}
                      href={`/citizen/request?requestType=${option.value}`}
                      className={`group flex min-h-44 flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${meta.accent}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.iconClass}`}
                        >
                          <Icon size={24} />
                        </span>
                        <ArrowRight
                          size={20}
                          className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700"
                        />
                      </div>
                      <div className="mt-5">
                        <h2 className="text-lg font-black text-slate-950">{option.shortLabel}</h2>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                          {option.label}
                        </p>
                        <p className="mt-3 text-xs leading-5 text-slate-600">{meta.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-950 p-7 text-white lg:border-l lg:border-t-0 sm:p-10">
              <div className="flex h-full flex-col justify-between gap-8">
                <div className="space-y-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500 text-white shadow-lg shadow-orange-500/25">
                    <Siren size={34} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-200">
                      Quick actions
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-normal">
                      เลือกการทำงานหลัก
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/citizen/track"
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white px-5 py-4 text-slate-950 transition hover:bg-blue-50"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <SearchCheck size={22} />
                      </span>
                      <span>
                        <span className="block text-sm font-black">ติดตามสถานะคำขอ</span>
                        <span className="text-xs font-semibold text-slate-500">
                          ตรวจสอบความคืบหน้าด้วยรหัสติดตาม
                        </span>
                      </span>
                    </span>
                    <ArrowRight size={20} className="transition group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/developer"
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-white transition hover:bg-white/15"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
                        <Code2 size={22} />
                      </span>
                      <span>
                        <span className="block text-sm font-black">Dev</span>
                        <span className="text-xs font-semibold text-slate-300">
                          API, health check และเมนูจัดการระบบ
                        </span>
                      </span>
                    </span>
                    <ArrowRight size={20} className="transition group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
