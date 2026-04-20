// src/app/page.tsx
import Link from 'next/link';
import { AlertTriangle, Activity, ClipboardList, SearchCheck, Siren } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { DeveloperSection } from '@/components/home/developer-section';

const TEXT = {
  title: 'ระบบจัดการคำขอช่วยเหลือผู้ประสบภัย',
  name: 'ภัทรภูมิ กิ่งชัย',
  studentId: 'รหัสนักศึกษา 6609612160',
};

const HOME_ACTIONS = [
  {
    label: 'แจ้งขอความช่วยเหลือ',
    description: 'ส่งแบบฟอร์มเพื่อขอรับการช่วยเหลือฉุกเฉิน',
    href: '/citizen/request',
    icon: AlertTriangle,
    className: 'border-red-100 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-200 hover:shadow-md',
    iconBg: 'bg-red-100 text-red-600',
  },
  {
    label: 'ติดตามสถานะคำขอ',
    description: 'ตรวจสอบความคืบหน้าการช่วยเหลือของคุณ',
    href: '/citizen/track',
    icon: SearchCheck,
    className: 'border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-200 hover:shadow-md',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'จัดการรายการคำขอ',
    description: 'ระบบกระดานจัดการสำหรับเจ้าหน้าที่ (Staff)',
    href: '/admin/incident',
    icon: ClipboardList,
    className: 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200 hover:shadow-md',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    label: 'ติดตามเหตุการณ์ (Pub/Sub)',
    description: 'ดูสตรีมข้อมูลและเหตุการณ์แบบเรียลไทม์',
    href: '/admin/pubsub',
    icon: Activity,
    className: 'border-cyan-100 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 hover:border-cyan-200 hover:shadow-md',
    iconBg: 'bg-cyan-100 text-cyan-600',
  },
];

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

export default function HomePage() {
  const apiBaseUrl = resolveApiBaseUrl(
    process.env.API_PROXY_TARGET,
    process.env.NEXT_PUBLIC_API_BASE_URL,
  );
  const snsTopicArn = (process.env.NEXT_PUBLIC_SNS_TOPIC_ARN ?? '').trim();

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8 py-10 px-4 sm:px-0">
        {/* Header Section */}
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-inner">
              <Siren size={32} />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                {TEXT.title}
              </h1>
              <p className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                {TEXT.name} - {TEXT.studentId}
              </p>
            </div>
          </div>
        </section>

        {/* Actions Section */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {HOME_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`group flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 ${action.className}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-xl p-3 transition-colors ${action.iconBg}`}>
                    <Icon size={24} />
                  </div>
                  <div className="space-y-1.5 mt-1">
                    <h2 className="text-lg font-bold tracking-tight">{action.label}</h2>
                    <p className="text-sm font-medium opacity-80 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
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
