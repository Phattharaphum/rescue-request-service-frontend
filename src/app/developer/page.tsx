import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Braces,
  ClipboardList,
  Code2,
  FileJson2,
  RadioTower,
  TerminalSquare,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { DeveloperSection } from '@/components/home/developer-section';

const API_DOCUMENT_URL =
  'https://github.com/Phattharaphum/rescue-request-service/blob/main/docs/api-summary.md';

function normalizeApiBaseUrl(url: string): string {
  const withoutTrailingSlashes = url.trim().replace(/\/+$/, '');
  if (!withoutTrailingSlashes) return '';

  return withoutTrailingSlashes.endsWith('/v1')
    ? withoutTrailingSlashes
    : `${withoutTrailingSlashes}/v1`;
}

function resolveApiBaseUrl(
  apiProxyTarget: string | undefined,
  publicApiBaseUrl: string | undefined,
): string {
  if (apiProxyTarget?.trim()) {
    return normalizeApiBaseUrl(apiProxyTarget);
  }

  const publicBase = publicApiBaseUrl?.trim() ?? '';
  if (!publicBase) return '';

  if (publicBase.startsWith('http://') || publicBase.startsWith('https://')) {
    return normalizeApiBaseUrl(publicBase);
  }

  return publicBase.replace(/\/+$/, '');
}

const CONSOLE_LINKS = [
  {
    href: '/admin/incident',
    icon: ClipboardList,
    title: 'จัดการคำขอ',
    description: 'เปิด dashboard สำหรับตรวจและอัปเดตคำขอช่วยเหลือ',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    href: '/admin/pubsub',
    icon: Activity,
    title: 'Pub/Sub stream',
    description: 'ดูเหตุการณ์ที่ไหลเข้าระบบแบบใกล้เคียงเรียลไทม์',
    className: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  },
];

const HERO_STATS = [
  { label: 'API base', value: 'v1', tone: 'bg-cyan-100 text-cyan-700' },
  { label: 'Health', value: 'ready', tone: 'bg-emerald-100 text-emerald-700' },
  { label: 'Events', value: 'SNS', tone: 'bg-amber-100 text-amber-800' },
];

export default function DeveloperPage() {
  const apiBaseUrl = resolveApiBaseUrl(
    process.env.API_PROXY_TARGET,
    process.env.NEXT_PUBLIC_API_BASE_URL,
  );
  const snsTopicArn = (process.env.NEXT_PUBLIC_SNS_TOPIC_ARN ?? '').trim();

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white">
          <div className="grid h-2 grid-cols-4">
            <div className="bg-cyan-400" />
            <div className="bg-emerald-400" />
            <div className="bg-amber-300" />
            <div className="bg-rose-400" />
          </div>

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:p-8">
            <div className="min-w-0">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                <Code2 size={15} />
                Developer Console
              </div>

              <div className="mt-7 max-w-3xl space-y-4">
                <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
                  เครื่องมือสำหรับนักพัฒนา
                </h1>
                <p className="max-w-2xl text-base font-semibold leading-8 text-slate-600 sm:text-lg">
                  จุดรวมสำหรับตรวจ API base, ทดสอบ health check, เปิดเอกสาร และกระโดดไปหน้า admin ที่เกี่ยวข้องโดยไม่ต้องไล่หา route เอง
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {HERO_STATS.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
                    <p className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-sm font-black ${item.tone}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {CONSOLE_LINKS.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group rounded-2xl border p-4 transition-colors hover:bg-white active:scale-[0.99] ${link.className}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white text-current">
                          <Icon size={21} />
                        </span>
                        <ArrowRight
                          size={18}
                          className="text-slate-400 transition-transform group-hover:translate-x-1"
                        />
                      </div>
                      <p className="mt-4 text-sm font-black text-slate-950">{link.title}</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{link.description}</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-[28px] border border-slate-900 bg-slate-950 p-4 text-white sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Runtime panel</p>
                  <h2 className="mt-2 text-xl font-black">Dev operations</h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-cyan-200">
                  <TerminalSquare size={22} />
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117]">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                    console
                  </span>
                </div>
                <div className="space-y-3 p-4 font-mono text-xs leading-6">
                  <p className="text-cyan-200">$ GET /api/developer/health-ready</p>
                  <p className="text-emerald-300">status: ready</p>
                  <p className="text-amber-200">checks: api, dynamodb, sns</p>
                  <p className="break-all text-slate-400">base: {apiBaseUrl || 'not configured'}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="flex h-18 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <FileJson2 size={18} className="text-cyan-200" />
                  <span className="text-xs font-black text-slate-300">docs</span>
                </div>
                <div className="flex h-18 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <RadioTower size={18} className="text-emerald-200" />
                  <span className="text-xs font-black text-slate-300">events</span>
                </div>
                <div className="flex h-18 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <Braces size={18} className="text-amber-200" />
                  <span className="text-xs font-black text-slate-300">json</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <DeveloperSection
          apiBaseUrl={apiBaseUrl}
          apiDocumentUrl={API_DOCUMENT_URL}
          snsTopicArn={snsTopicArn}
        />
      </div>
    </AppShell>
  );
}
