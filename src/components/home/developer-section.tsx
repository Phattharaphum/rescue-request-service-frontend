'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Copy,
  Database,
  ExternalLink,
  Link2,
  Loader2,
  RadioTower,
  ServerCog,
  Timer,
} from 'lucide-react';
import { useCopy } from '@/lib/hooks/use-copy';
import { cn } from '@/lib/utils/cn';

interface DeveloperSectionProps {
  apiBaseUrl: string;
  apiDocumentUrl: string;
  snsTopicArn: string;
}

interface HealthTableResult {
  name?: string;
  tableName?: string;
  status?: string;
  tableStatus?: string;
  latencyMs?: number;
  issue?: string | null;
}

interface HealthPayload {
  service?: string;
  stage?: string;
  region?: string;
  status?: string;
  timestamp?: string;
  checks?: {
    dynamodb?: {
      status?: string;
      latencyMs?: number;
      tables?: HealthTableResult[];
    };
  };
}

interface HealthReadyResult {
  ok: boolean;
  message?: string;
  latencyMs?: number;
  payload?: HealthPayload | null;
}

interface CopyButtonProps {
  copied: boolean;
  disabled?: boolean;
  label: string;
  copiedLabel: string;
  onClick: () => void;
  tone?: 'cyan' | 'emerald' | 'amber';
}

function statusBadgeClass(status?: string): string {
  const normalized = (status ?? '').toLowerCase();
  if (normalized === 'pass' || normalized === 'active') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
  if (normalized === 'warn' || normalized === 'warning') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  if (normalized === 'fail' || normalized === 'error') {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function formatTimestamp(value?: string): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('th-TH');
}

function CopyButton({
  copied,
  disabled,
  label,
  copiedLabel,
  onClick,
  tone = 'cyan',
}: CopyButtonProps) {
  const toneClass =
    tone === 'emerald'
      ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
      : tone === 'amber'
        ? 'border-amber-300 text-amber-800 hover:bg-amber-50'
        : 'border-cyan-300 text-cyan-700 hover:bg-cyan-50';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-sm font-black transition-colors disabled:pointer-events-none disabled:opacity-50',
        copied ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : toneClass,
      )}
    >
      {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
      {copied ? copiedLabel : label}
    </button>
  );
}

function CodeValue({
  icon: Icon,
  label,
  value,
  emptyText,
  tone,
  copied,
  onCopy,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  emptyText: string;
  tone: 'cyan' | 'emerald' | 'amber';
  copied: boolean;
  onCopy: () => void;
}) {
  const hasValue = value.length > 0;
  const toneClass =
    tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'amber'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-cyan-200 bg-cyan-50 text-cyan-700';

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className={cn('inline-flex rounded-2xl border p-2', toneClass)}>
          <Icon size={18} />
        </div>
        <CopyButton
          onClick={onCopy}
          disabled={!hasValue}
          copied={copied}
          label="คัดลอก"
          copiedLabel="คัดลอกแล้ว"
          tone={tone}
        />
      </div>
      <p className="mt-4 text-sm font-black text-slate-950">{label}</p>
      <code
        className={cn(
          'mt-3 block break-all rounded-2xl border px-3 py-3 text-xs font-bold leading-6 sm:text-sm',
          hasValue ? 'border-slate-200 bg-slate-50 text-slate-800' : 'border-rose-200 bg-rose-50 text-rose-700',
        )}
      >
        {hasValue ? value : emptyText}
      </code>
    </div>
  );
}

export function DeveloperSection({
  apiBaseUrl,
  apiDocumentUrl,
  snsTopicArn,
}: DeveloperSectionProps) {
  const apiBaseCopy = useCopy();
  const snsTopicCopy = useCopy();
  const apiDocumentCopy = useCopy();

  const hasApiBaseUrl = apiBaseUrl.length > 0;
  const [isTesting, setIsTesting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [testResult, setTestResult] = useState<HealthReadyResult | null>(null);

  const canRunHealthCheck = hasApiBaseUrl && !isTesting && cooldownSeconds === 0;
  const dynamodbCheck = testResult?.payload?.checks?.dynamodb;
  const tables = Array.isArray(dynamodbCheck?.tables) ? dynamodbCheck.tables : [];

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((previous) => (previous <= 1 ? 0 : previous - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  async function runHealthCheck() {
    if (!canRunHealthCheck) return;

    setIsTesting(true);
    setCooldownSeconds(30);
    setTestResult(null);

    try {
      const response = await fetch('/api/developer/health-ready', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = (await response.json().catch(() => ({}))) as HealthReadyResult;
      setTestResult(payload);
    } catch {
      setTestResult({
        ok: false,
        message: 'ไม่สามารถเรียกทดสอบระบบได้ กรุณาลองใหม่อีกครั้ง',
      });
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-cyan-700">API workspace</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                ค่าระบบที่ทีม dev ใช้บ่อย
              </h2>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-500">
              environment ready
            </span>
          </div>

          <div className="grid gap-4">
            <CodeValue
              icon={Link2}
              label="API Base URL"
              value={apiBaseUrl}
              emptyText="ไม่พบค่า API base URL ใน environment"
              tone="cyan"
              copied={apiBaseCopy.copied}
              onCopy={() => apiBaseCopy.copy(apiBaseUrl)}
            />

            <CodeValue
              icon={RadioTower}
              label="SNS_TOPIC_ARN"
              value={snsTopicArn}
              emptyText="ไม่พบค่า NEXT_PUBLIC_SNS_TOPIC_ARN ใน environment"
              tone="amber"
              copied={snsTopicCopy.copied}
              onCopy={() => snsTopicCopy.copy(snsTopicArn)}
            />
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-emerald-700">Health check</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                ตรวจความพร้อมของ backend
              </h2>
            </div>
            {cooldownSeconds > 0 && (
              <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-600">
                Cooldown {cooldownSeconds}s
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={runHealthCheck}
            disabled={!canRunHealthCheck}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-950 bg-slate-950 px-4 text-sm font-black text-white transition-colors hover:bg-slate-800 disabled:pointer-events-none disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 sm:w-auto"
          >
            {isTesting ? <Loader2 size={17} className="animate-spin" /> : <ServerCog size={17} />}
            {isTesting
              ? 'กำลังทดสอบระบบ...'
              : cooldownSeconds > 0
                ? `ทดสอบได้อีกครั้งใน ${cooldownSeconds} วินาที`
                : 'ทดสอบความพร้อมระบบ'}
          </button>

          {isTesting && (
            <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
              <div className="flex items-start gap-3">
                <Loader2 size={20} className="mt-0.5 shrink-0 animate-spin text-cyan-700" />
                <div>
                  <p className="text-sm font-black text-cyan-900">กำลังตรวจสอบบริการและฐานข้อมูล</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-cyan-700">
                    ระบบกำลังวัดเวลาตอบกลับและตรวจสถานะของ dependency หลัก
                  </p>
                </div>
              </div>
            </div>
          )}

          {testResult && (
            <div className="mt-4 space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-black text-slate-700">สถานะบริการ</span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black uppercase',
                    statusBadgeClass(testResult.payload?.status ?? (testResult.ok ? 'pass' : 'fail')),
                  )}
                >
                  {testResult.payload?.status ?? (testResult.ok ? 'pass' : 'fail')}
                </span>
                {!testResult.ok && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                    <CircleAlert size={14} />
                    ตรวจสอบไม่ผ่าน
                  </span>
                )}
              </div>

              {testResult.message && (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                  {testResult.message}
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard label="บริการ" value={testResult.payload?.service ?? '-'} />
                <MetricCard
                  label="Stage / Region"
                  value={`${testResult.payload?.stage ?? '-'} / ${testResult.payload?.region ?? '-'}`}
                />
                <MetricCard
                  label="เวลาตอบกลับ API"
                  value={
                    typeof testResult.latencyMs === 'number'
                      ? `${testResult.latencyMs.toLocaleString()} ms`
                      : '-'
                  }
                  icon={Timer}
                />
                <MetricCard label="เวลาตรวจสอบ" value={formatTimestamp(testResult.payload?.timestamp)} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="inline-flex items-center gap-2 text-sm font-black text-slate-900">
                    <Database size={16} className="text-cyan-600" />
                    DynamoDB
                  </p>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black uppercase',
                      statusBadgeClass(dynamodbCheck?.status),
                    )}
                  >
                    {dynamodbCheck?.status ?? '-'}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-600">
                  Latency:{' '}
                  {typeof dynamodbCheck?.latencyMs === 'number'
                    ? `${dynamodbCheck.latencyMs.toLocaleString()} ms`
                    : '-'}
                </p>

                {tables.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {tables.map((table, index) => (
                      <div
                        key={`${table.tableName ?? table.name ?? 'table'}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-black text-slate-900">
                            {table.name ?? '-'} ({table.tableName ?? '-'})
                          </p>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-black uppercase',
                              statusBadgeClass(table.status),
                            )}
                          >
                            {table.status ?? '-'}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
                          <span>TableStatus: {table.tableStatus ?? '-'}</span>
                          <span>
                            Latency:{' '}
                            {typeof table.latencyMs === 'number'
                              ? `${table.latencyMs.toLocaleString()} ms`
                              : '-'}
                          </span>
                          {table.issue && <span className="text-rose-600">Issue: {table.issue}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-[30px] border border-emerald-200 bg-emerald-50 p-5">
          <div className="mb-4 inline-flex rounded-2xl border border-emerald-200 bg-white p-2 text-emerald-700">
            <BookOpen size={20} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">API Document</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-emerald-900">
            เอกสารสรุป endpoint, request/response และ workflow สำหรับทีมพัฒนาและทดสอบระบบ
          </p>

          <div className="mt-5 grid gap-2">
            <a
              href={apiDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-700 bg-emerald-700 px-4 text-sm font-black text-white transition-colors hover:bg-emerald-800"
            >
              เปิดเอกสาร API
              <ExternalLink size={15} />
            </a>
            <CopyButton
              onClick={() => apiDocumentCopy.copy(apiDocumentUrl)}
              copied={apiDocumentCopy.copied}
              label="คัดลอกลิงก์"
              copiedLabel="คัดลอกแล้ว"
              tone="emerald"
            />
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-5">
          <p className="text-sm font-black text-slate-500">Quick checklist</p>
          <div className="mt-4 space-y-3">
            {[
              'ตั้งค่า API base URL',
              'ตรวจ SNS topic ARN',
              'ทดสอบ health check',
              'เปิดเอกสาร endpoint',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                <span className="text-sm font-bold text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 inline-flex items-center gap-1.5 break-all text-sm font-black text-slate-950">
        {Icon && <Icon size={14} className="shrink-0 text-cyan-600" />}
        {value}
      </p>
    </div>
  );
}
