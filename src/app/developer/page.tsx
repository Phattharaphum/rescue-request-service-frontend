import Link from 'next/link';
import { Activity, ArrowRight, ClipboardList, Code2 } from 'lucide-react';
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

export default function DeveloperPage() {
  const apiBaseUrl = resolveApiBaseUrl(
    process.env.API_PROXY_TARGET,
    process.env.NEXT_PUBLIC_API_BASE_URL,
  );
  const snsTopicArn = (process.env.NEXT_PUBLIC_SNS_TOPIC_ARN ?? '').trim();

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-0">
        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-7 text-white shadow-sm sm:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                <Code2 size={24} />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">
                Developer Console
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
                ผู้พัฒนา
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                รวมข้อมูล API, health check และทางลัดสำหรับจัดการรายการคำขอและติดตาม Pub/Sub
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:min-w-96">
              <Link
                href="/admin/incident"
                className="group rounded-2xl border border-white/10 bg-white px-4 py-4 text-slate-950 transition hover:bg-emerald-50"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <ClipboardList size={20} />
                    </span>
                    <span className="text-sm font-black">จัดการรายการคำขอ</span>
                  </span>
                  <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                </span>
              </Link>

              <Link
                href="/admin/pubsub"
                className="group rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white transition hover:bg-white/15"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
                      <Activity size={20} />
                    </span>
                    <span className="text-sm font-black">ติดตาม Pub/Sub</span>
                  </span>
                  <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
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
