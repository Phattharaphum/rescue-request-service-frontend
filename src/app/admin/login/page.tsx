'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight, KeyRound, LockKeyhole, Radio, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { cn } from '@/lib/utils/cn';

const accessItems = [
  {
    icon: ShieldCheck,
    title: 'Admin only',
    description: 'ใช้สำหรับเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น',
    tone: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  },
  {
    icon: Radio,
    title: 'Live operation',
    description: 'เข้าสู่แดชบอร์ดจัดการเหตุและคำขอช่วยเหลือ',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    icon: LockKeyhole,
    title: 'Protected route',
    description: 'ตรวจสอบ session ก่อนเปิดหน้า admin',
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
  },
];

function resolveNextPath(nextParam: string | null): string {
  if (!nextParam) return '/admin/incident';

  const normalized = nextParam.trim();
  if (!normalized.startsWith('/admin')) return '/admin/incident';
  if (normalized === '/admin/login' || normalized.startsWith('/admin/login?')) {
    return '/admin/incident';
  }

  return normalized;
}

function LoadingGate() {
  return (
    <AppShell>
      <div className="mx-auto grid min-h-[calc(100vh-180px)] w-full max-w-6xl place-items-center">
        <div className="w-full max-w-md overflow-hidden rounded-[30px] border border-slate-200 bg-white">
          <div className="grid h-2 grid-cols-4">
            <div className="bg-cyan-400" />
            <div className="bg-emerald-400" />
            <div className="bg-amber-300" />
            <div className="bg-rose-400" />
          </div>
          <div className="space-y-5 p-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl border border-slate-200 bg-slate-50 text-slate-700">
              <ShieldCheck className="animate-pulse" size={24} />
            </div>
            <div>
              <p className="text-lg font-black text-slate-950">กำลังตรวจสอบสิทธิ์</p>
              <p className="mt-1 text-sm text-slate-500">ระบบกำลังตรวจ session ของผู้ดูแล</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const nextPath = resolveNextPath(searchParams.get('next'));

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch('/api/admin/session', {
          method: 'GET',
          cache: 'no-store',
        });

        if (response.ok) {
          const payload = (await response.json()) as { authenticated?: boolean };
          if (payload.authenticated) {
            router.replace(nextPath);
            router.refresh();
            return;
          }
        }
      } catch {
        // Login form remains available when session checking fails.
      }

      if (!cancelled) {
        setIsCheckingSession(false);
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [nextPath, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password.trim()) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setError(payload.message ?? 'ไม่สามารถเข้าสู่ระบบได้');
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError('ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) return <LoadingGate />;

  return (
    <AppShell>
      <main className="mx-auto grid min-h-[calc(100vh-180px)] w-full max-w-6xl items-center gap-5 lg:grid-cols-[1fr_440px]">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white">
          <div className="grid h-2 grid-cols-4">
            <div className="bg-cyan-400" />
            <div className="bg-emerald-400" />
            <div className="bg-amber-300" />
            <div className="bg-rose-400" />
          </div>

          <div className="p-5 sm:p-7 lg:p-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Secure access
            </div>

            <div className="mt-7 max-w-2xl space-y-4">
              <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                เข้าสู่ระบบผู้ดูแล
              </h1>
              <p className="text-base leading-8 text-slate-600 sm:text-lg">
                เข้าถึงแดชบอร์ดสำหรับติดตามเหตุการณ์ ตรวจคำขอ และจัดการงานช่วยเหลือจากศูนย์ปฏิบัติการ
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {accessItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className={cn('mb-4 inline-flex rounded-2xl border p-2', item.tone)}>
                      <Icon size={18} />
                    </div>
                    <p className="text-sm font-black text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white">
          <div className="grid h-2 grid-cols-4 lg:hidden">
            <div className="bg-cyan-400" />
            <div className="bg-emerald-400" />
            <div className="bg-amber-300" />
            <div className="bg-rose-400" />
          </div>

          <div className="p-5 sm:p-7">
            <div className="mb-7 flex items-start gap-4">
              <div className="grid h-13 w-13 shrink-0 place-items-center rounded-3xl border border-slate-200 bg-slate-50 text-slate-800">
                <KeyRound size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Admin gate</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">ยืนยันรหัสผ่าน</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">ระบบจะพาไปยังหน้าที่ร้องขอหลังเข้าสู่ระบบสำเร็จ</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800" role="alert">
                  <AlertCircle className="mt-0.5 shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="text-sm font-black">เข้าสู่ระบบไม่สำเร็จ</p>
                    <p className="mt-1 text-sm leading-6">{error}</p>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="mt-3 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-black text-rose-700 transition-colors hover:bg-rose-100"
                    >
                      ลองกรอกใหม่
                    </button>
                  </div>
                </div>
              )}

              <label className="block space-y-2">
                <span className="text-sm font-black text-slate-800">รหัสผ่านผู้ดูแล</span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoFocus
                    className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pl-12 text-base font-bold text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white"
                    placeholder="กรอกรหัสผ่าน"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !password.trim()}
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-slate-950 bg-slate-950 px-5 text-base font-black text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500"
              >
                {isSubmitting ? 'กำลังเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingGate />}>
      <AdminLoginContent />
    </Suspense>
  );
}
