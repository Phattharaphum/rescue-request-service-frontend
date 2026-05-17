'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  Clock,
  Eye,
  Info,
  Pause,
  Play,
  Radio,
  Terminal,
  Trash2,
  X,
} from 'lucide-react';
import { useSnsStream } from '@/lib/hooks/use-sns-stream';
import { cn } from '@/lib/utils/cn';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date';
import { SnsStreamEvent, SnsStreamStatus } from '@/types/sns';

const EVENT_BADGE_COLORS: Record<string, string> = {
  'rescue-request.created': 'border-emerald-300 bg-emerald-100 text-emerald-800',
  'rescue-request.status-changed': 'border-cyan-300 bg-cyan-100 text-cyan-800',
  'rescue-request.citizen-updated': 'border-amber-300 bg-amber-100 text-amber-800',
  'rescue-request.resolved': 'border-indigo-300 bg-indigo-100 text-indigo-800',
  'rescue-request.cancelled': 'border-rose-300 bg-rose-100 text-rose-800',
  'raw-message': 'border-slate-300 bg-slate-100 text-slate-800',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  'rescue-request.created': 'สร้างคำขอใหม่',
  'rescue-request.status-changed': 'เปลี่ยนสถานะ',
  'rescue-request.citizen-updated': 'ผู้ประสบภัยอัปเดตข้อมูล',
  'rescue-request.resolved': 'ปิดงานสำเร็จ',
  'rescue-request.cancelled': 'ยกเลิกคำขอ',
  'raw-message': 'ข้อความดิบ',
};

const EVENT_TYPE_OPTIONS = [
  { value: '', label: 'ทุกประเภทเหตุการณ์' },
  { value: 'rescue-request.created', label: EVENT_TYPE_LABELS['rescue-request.created'] },
  { value: 'rescue-request.status-changed', label: EVENT_TYPE_LABELS['rescue-request.status-changed'] },
  { value: 'rescue-request.citizen-updated', label: EVENT_TYPE_LABELS['rescue-request.citizen-updated'] },
  { value: 'rescue-request.resolved', label: EVENT_TYPE_LABELS['rescue-request.resolved'] },
  { value: 'rescue-request.cancelled', label: EVENT_TYPE_LABELS['rescue-request.cancelled'] },
  { value: 'raw-message', label: EVENT_TYPE_LABELS['raw-message'] },
];

interface SnsEventStreamProps {
  mode?: 'mock' | 'sse';
  sseUrl?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function getEventSummary(event: SnsStreamEvent): string {
  const body = asRecord(event.body);
  const eventType = event.metadata.eventType;

  if (!body) return 'รับข้อมูลเหตุการณ์ใหม่จาก stream';

  if (eventType === 'rescue-request.status-changed') {
    const previousStatus = toStringValue(body.previousStatus);
    const newStatus = toStringValue(body.newStatus);
    if (previousStatus && newStatus) return `เปลี่ยนสถานะจาก ${previousStatus} เป็น ${newStatus}`;
    if (newStatus) return `สถานะล่าสุด: ${newStatus}`;
  }

  if (eventType === 'rescue-request.citizen-updated') {
    const updateType = toStringValue(body.updateType);
    if (updateType) return `อัปเดตข้อมูล: ${updateType}`;
  }

  if (eventType === 'rescue-request.created') {
    const data = asRecord(body.data);
    const requestType = toStringValue(data?.requestType ?? body.requestType);
    if (requestType) return `สร้างคำขอความช่วยเหลือใหม่ (${requestType})`;
    return 'สร้างคำขอความช่วยเหลือใหม่';
  }

  if (eventType === 'rescue-request.resolved') return 'ดำเนินการคำขอเรียบร้อยแล้ว';
  if (eventType === 'rescue-request.cancelled') return 'คำขอถูกยกเลิก';

  return 'รับข้อมูลเหตุการณ์ใหม่จาก stream';
}

function EventTypeBadge({ eventType }: { eventType: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black',
        EVENT_BADGE_COLORS[eventType] ?? 'border-slate-300 bg-slate-100 text-slate-800',
      )}
    >
      {EVENT_TYPE_LABELS[eventType] ?? eventType}
    </span>
  );
}

function StatusPill({ status }: { status: SnsStreamStatus }) {
  const statusMap = {
    connected: {
      label: 'เชื่อมต่ออยู่',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      dot: 'bg-emerald-500 animate-pulse',
    },
    paused: {
      label: 'พักสตรีม',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
      dot: 'bg-amber-500',
    },
    disconnected: {
      label: 'หลุดการเชื่อมต่อ',
      className: 'border-slate-200 bg-slate-50 text-slate-600',
      dot: 'bg-slate-400',
    },
  } satisfies Record<SnsStreamStatus, { label: string; className: string; dot: string }>;

  const item = statusMap[status];

  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black', item.className)}>
      <span className={cn('h-2.5 w-2.5 rounded-full', item.dot)} />
      {item.label}
    </span>
  );
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="max-h-[420px] overflow-auto rounded-2xl border border-slate-800 bg-[#0d1117] p-4 text-xs leading-6 text-slate-100">
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
}

function DetailModal({
  event,
  onClose,
}: {
  event: SnsStreamEvent | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!event) return;

    const onKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="ปิดหน้าต่างรายละเอียด" onClick={onClose} />
      <section className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white">
        <div className="grid h-1.5 grid-cols-4">
          <div className="bg-cyan-400" />
          <div className="bg-emerald-400" />
          <div className="bg-amber-300" />
          <div className="bg-rose-400" />
        </div>

        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Event detail</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">รายละเอียดเหตุการณ์</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100"
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </header>

        <div className="overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard icon={Info} label="ประเภทเหตุการณ์">
              <EventTypeBadge eventType={event.metadata.eventType} />
            </InfoCard>
            <InfoCard icon={Terminal} label="Event ID">
              <p className="break-all font-mono text-xs font-bold text-cyan-700">{event.metadata.eventId}</p>
            </InfoCard>
            <InfoCard icon={Clock} label="เวลา">
              <p className="text-sm font-bold text-slate-900">{formatDateTime(event.metadata.timestamp)}</p>
            </InfoCard>
            <InfoCard icon={Radio} label="Source">
              <p className="break-all text-sm font-bold text-slate-900">{event.metadata.source}</p>
            </InfoCard>
            <InfoCard icon={Terminal} label="Partition key">
              <p className="break-all font-mono text-xs font-bold text-slate-700">{event.metadata.partitionKey}</p>
            </InfoCard>
            <InfoCard icon={Info} label="Correlation ID">
              <p className="break-all font-mono text-xs font-bold text-slate-700">{event.metadata.correlationId ?? '-'}</p>
            </InfoCard>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-black text-slate-950">
              <Terminal size={16} />
              Payload body
            </div>
            <JsonBlock data={event.body} />
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-slate-400">
        <Icon size={14} />
        {label}
      </p>
      {children}
    </div>
  );
}

export function SnsEventStream({ mode = 'mock', sseUrl }: SnsEventStreamProps) {
  const { events, status, stats, pause, resume, clear, isAutoScroll, setAutoScroll } =
    useSnsStream({ mode, sseUrl, autoStart: true });
  const [filterType, setFilterType] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<SnsStreamEvent | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredEvents = useMemo(
    () => (filterType ? events.filter((event) => event.metadata.eventType === filterType) : events),
    [events, filterType],
  );

  useEffect(() => {
    if (isAutoScroll && listRef.current) listRef.current.scrollTop = 0;
  }, [events, isAutoScroll]);

  const hasEvents = filteredEvents.length > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={status} />
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">
              <Terminal size={14} />
              ทั้งหมด {stats.total} รายการ
            </span>
            {filterType && (
              <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700">
                กำลังดู: {EVENT_TYPE_LABELS[filterType] ?? filterType}
              </span>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(0,240px)_auto_auto_auto] lg:min-w-[620px]">
            <label className="relative block">
              <span className="sr-only">ประเภทเหตุการณ์</span>
              <select
                value={filterType}
                onChange={(event) => setFilterType(event.target.value)}
                className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-bold text-slate-800 outline-none transition-colors focus:border-cyan-400"
              >
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </label>

            <button
              type="button"
              role="switch"
              aria-checked={isAutoScroll}
              onClick={() => setAutoScroll(!isAutoScroll)}
              className={cn(
                'inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-black transition-colors',
                isAutoScroll ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600',
              )}
            >
              <span className={cn('h-2.5 w-2.5 rounded-full', isAutoScroll ? 'bg-emerald-500' : 'bg-slate-300')} />
              Auto
            </button>

            <button
              type="button"
              onClick={status === 'connected' ? pause : resume}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-950 bg-slate-950 px-4 text-sm font-black text-white transition-colors hover:bg-slate-800"
            >
              {status === 'connected' ? <Pause size={16} /> : <Play size={16} />}
              {status === 'connected' ? 'พัก' : 'เริ่ม'}
            </button>

            <button
              type="button"
              onClick={clear}
              disabled={!events.length}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Trash2 size={16} />
              ล้าง
            </button>
          </div>
        </div>

        {stats.total > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type === filterType ? '' : type)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-black transition-colors',
                  EVENT_BADGE_COLORS[type] ?? 'border-slate-200 bg-white text-slate-700',
                  filterType === type && 'ring-2 ring-slate-950/10',
                )}
              >
                {EVENT_TYPE_LABELS[type] ?? type} · {count}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-[26px] border border-slate-800 bg-[#0d1117]">
        <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            event stream
          </div>
          <p className="text-xs font-bold text-slate-500">
            แสดง {filteredEvents.length} จาก {events.length} รายการ
          </p>
        </div>

        <div ref={listRef} className="h-[540px] overflow-y-auto p-3">
          {!hasEvents && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-cyan-200">
                <Terminal size={36} />
              </div>
              <div>
                <p className="text-base font-black text-slate-100">
                  {status === 'connected' ? 'กำลังรอรับข้อมูล' : 'ยังไม่มีข้อมูลแสดงผล'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {filterType ? 'ลองเปลี่ยนตัวกรองหรือรอเหตุการณ์ใหม่' : 'เหตุการณ์ใหม่จะแสดงที่นี่ทันทีเมื่อ stream ส่งข้อมูลเข้ามา'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <button
                key={event._id}
                type="button"
                onClick={() => setSelectedEvent(event)}
                className="group w-full rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left transition-colors hover:border-cyan-300/60 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-500">
                        {formatRelativeTime(event._receivedAt)}
                      </span>
                      <EventTypeBadge eventType={event.metadata.eventType} />
                    </div>
                    <p className="text-sm font-bold text-slate-100">{getEventSummary(event)}</p>
                    <p className="truncate font-mono text-xs text-cyan-200">id: {event.metadata.eventId}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-slate-300">
                    <Eye size={14} />
                    เปิดดู
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <DetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
