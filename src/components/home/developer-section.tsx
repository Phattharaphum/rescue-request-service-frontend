'use client';

import { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Copy,
  Database,
  ExternalLink,
  Link2,
  ServerCog,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopy } from '@/lib/hooks/use-copy';

interface DeveloperSectionProps {
  apiBaseUrl: string;
  apiDocumentUrl: string;
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
  healthUrl?: string;
  latencyMs?: number;
  payload?: HealthPayload | null;
}

function statusBadgeClass(status?: string): string {
  const normalized = (status ?? '').toLowerCase();
  if (normalized === 'pass' || normalized === 'active') {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  if (normalized === 'warn' || normalized === 'warning') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  if (normalized === 'fail' || normalized === 'error') {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

function formatTimestamp(value?: string): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('th-TH');
}

export function DeveloperSection({
  apiBaseUrl,
  apiDocumentUrl,
}: DeveloperSectionProps) {
  const { copy, copied } = useCopy();
  const hasApiBaseUrl = apiBaseUrl.length > 0;
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<HealthReadyResult | null>(null);

  const healthEndpoint = useMemo(
    () => (hasApiBaseUrl ? `${apiBaseUrl}/health/ready` : ''),
    [apiBaseUrl, hasApiBaseUrl],
  );

  const dynamodbCheck = testResult?.payload?.checks?.dynamodb;
  const tables = Array.isArray(dynamodbCheck?.tables) ? dynamodbCheck?.tables : [];

  async function runHealthCheck() {
    setIsTesting(true);
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
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">ผู้พัฒนา</h2>
        <p className="mt-1 text-sm text-gray-500">
          ข้อมูล API สำหรับใช้งานและอ้างอิงการพัฒนา
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-800">
            <Link2 size={16} />
            API Base URL
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <code className="break-all rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm sm:text-sm">
              {hasApiBaseUrl ? apiBaseUrl : 'ไม่พบค่า API_PROXY_TARGET ใน environment'}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copy(apiBaseUrl)}
              disabled={!hasApiBaseUrl}
              leftIcon={
                copied ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )
              }
              className={copied ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' : ''}
            >
              {copied ? 'คัดลอกแล้ว' : 'คัดลอก URL'}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-800">
            <ServerCog size={16} />
            Health Check
          </div>

          <div className="space-y-3">
            <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Endpoint</p>
              <code className="mt-1 block break-all text-xs font-semibold text-gray-800 sm:text-sm">
                {healthEndpoint || '-'}
              </code>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={runHealthCheck}
              loading={isTesting}
              disabled={!hasApiBaseUrl || isTesting}
              leftIcon={!isTesting ? <ServerCog size={16} /> : undefined}
              className="w-full sm:w-auto"
            >
              {isTesting ? 'กำลังทดสอบระบบ...' : 'ทดสอบความพร้อมระบบ'}
            </Button>

            {testResult && (
              <div className="space-y-3 rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">สถานะบริการ:</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${statusBadgeClass(
                      testResult.payload?.status,
                    )}`}
                  >
                    {testResult.payload?.status ?? (testResult.ok ? 'pass' : 'fail')}
                  </span>
                  {!testResult.ok && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                      <CircleAlert size={14} />
                      ตรวจสอบไม่ผ่าน
                    </span>
                  )}
                </div>

                {testResult.message && (
                  <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    {testResult.message}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-xs text-gray-500">บริการ</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {testResult.payload?.service ?? '-'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-xs text-gray-500">Stage / Region</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {(testResult.payload?.stage ?? '-') + ' / ' + (testResult.payload?.region ?? '-')}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-xs text-gray-500">เวลาตอบกลับ API</p>
                    <p className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <Timer size={14} className="text-indigo-600" />
                      {typeof testResult.latencyMs === 'number'
                        ? `${testResult.latencyMs.toLocaleString()} ms`
                        : '-'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-xs text-gray-500">เวลาตรวจสอบ</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatTimestamp(testResult.payload?.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="inline-flex items-center gap-1 text-sm font-semibold text-gray-800">
                      <Database size={14} className="text-indigo-600" />
                      สถานะฐานข้อมูล DynamoDB
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${statusBadgeClass(
                        dynamodbCheck?.status,
                      )}`}
                    >
                      {dynamodbCheck?.status ?? '-'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    เวลาตอบกลับฐานข้อมูล:{' '}
                    {typeof dynamodbCheck?.latencyMs === 'number'
                      ? `${dynamodbCheck.latencyMs.toLocaleString()} ms`
                      : '-'}
                  </p>

                  {tables.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {tables.map((table, index) => (
                        <div
                          key={`${table.tableName ?? table.name ?? 'table'}-${index}`}
                          className="rounded-md border border-gray-200 bg-white p-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-gray-900">
                              {table.name ?? '-'} ({table.tableName ?? '-'})
                            </p>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase ${statusBadgeClass(
                                table.status,
                              )}`}
                            >
                              {table.status ?? '-'}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
                            <span>TableStatus: {table.tableStatus ?? '-'}</span>
                            <span>
                              Latency:{' '}
                              {typeof table.latencyMs === 'number'
                                ? `${table.latencyMs.toLocaleString()} ms`
                                : '-'}
                            </span>
                            {table.issue && <span className="text-red-600">Issue: {table.issue}</span>}
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

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <BookOpen size={16} />
            API Document
          </div>
          <a
            href={apiDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100/60"
          >
            เปิดเอกสาร API
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
