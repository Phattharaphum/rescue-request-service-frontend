'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { EmptyState } from '@/components/shared/empty-state';
import { JsonViewer } from '@/components/shared/json-viewer';
import { StatusBadge } from '@/components/shared/status-badge';
import { listRequestEvents } from '@/lib/api/rescue';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { StatusEvent } from '@/types/rescue';

interface EventsListProps {
  requestId: string;
}

function renderText(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return '-';
  }
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length > 0;
  return true;
}

function EventField({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-3', className)}>
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1.5 break-words text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function EventCard({ event, isLatest }: { event: StatusEvent; isLatest: boolean }) {
  const hasMeta = hasValue(event.meta);

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-colors',
        isLatest ? 'border-cyan-200 bg-cyan-50' : 'border-slate-200 bg-slate-50',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={event.newStatus} size="sm" dot />
        {isLatest && <Badge variant="blue" size="sm">ล่าสุด</Badge>}
        <Badge variant="gray" size="sm">v{event.version}</Badge>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <Clock size={12} className="text-slate-400" />
          {formatRelativeTime(event.occurredAt)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <EventField label="eventId" className="sm:col-span-2" value={<code className="font-mono text-xs">{event.eventId}</code>} />
        <EventField label="requestId" className="sm:col-span-2" value={<code className="font-mono text-xs">{event.requestId}</code>} />
        {event.previousStatus && <EventField label="previousStatus" value={<StatusBadge status={event.previousStatus} size="sm" />} />}
        <EventField label="newStatus" value={<StatusBadge status={event.newStatus} size="sm" />} />
        {hasValue(event.changedBy) && <EventField label="changedBy" value={renderText(event.changedBy)} />}
        {hasValue(event.changedByRole) && <EventField label="changedByRole" value={renderText(event.changedByRole)} />}
        {event.priorityScore !== null && event.priorityScore !== undefined && <EventField label="priorityScore" value={renderText(event.priorityScore)} />}
        {hasValue(event.priorityLevel) && <EventField label="priorityLevel" value={renderText(event.priorityLevel)} />}
        {hasValue(event.responderUnitId) && <EventField label="responderUnitId" value={renderText(event.responderUnitId)} />}
        <EventField
          label="occurredAt"
          className="sm:col-span-2"
          value={
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900">{formatDateTime(event.occurredAt)}</p>
              <p className="text-xs text-slate-500">{formatRelativeTime(event.occurredAt)}</p>
            </div>
          }
        />
        {hasValue(event.changeReason) && <EventField label="changeReason" className="sm:col-span-2" value={renderText(event.changeReason)} />}
        {hasValue(event.note) && <EventField label="note" className="sm:col-span-2" value={renderText(event.note)} />}
        {hasMeta && <EventField label="meta" className="sm:col-span-2" value={<JsonViewer data={event.meta} collapsed maxHeight="220px" className="bg-white" />} />}
        <EventField label="rawEvent" className="sm:col-span-2" value={<JsonViewer data={event} collapsed maxHeight="280px" className="bg-white" />} />
      </div>
    </div>
  );
}

export function EventsList({ requestId }: EventsListProps) {
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['events', requestId, order],
    queryFn: () => listRequestEvents(requestId, { limit: 100, order }),
  });

  const toggleOrder = () => {
    setOrder((current) => (current === 'DESC' ? 'ASC' : 'DESC'));
  };

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-cyan-700">Timeline</p>
          <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">
            ประวัติการดำเนินการ
          </h2>
        </div>
        <button
          type="button"
          onClick={toggleOrder}
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700 transition-colors hover:bg-white"
        >
          {order === 'DESC' ? <ArrowDown size={14} className="text-cyan-600" /> : <ArrowUp size={14} className="text-cyan-600" />}
          {order === 'DESC' ? 'ล่าสุดก่อน' : 'เก่าสุดก่อน'}
        </button>
      </div>

      {isLoading && <LoadingState message="กำลังโหลดประวัติ..." />}
      {error && <ErrorAlert message="ไม่สามารถโหลดประวัติได้" onRetry={() => refetch()} />}
      {!isLoading && !error && data?.items.length === 0 && (
        <EmptyState title="ยังไม่มีประวัติการดำเนินการ" />
      )}
      {!isLoading && data && data.items.length > 0 && (
        <div className="space-y-3">
          <ol className="relative space-y-4 border-l border-slate-200 pl-5">
            {data.items.map((event, index) => {
              const isLatest = order === 'DESC' ? index === 0 : index === data.items.length - 1;
              return (
                <li key={event.eventId} className="relative">
                  <span
                    className={`absolute -left-[1.72rem] top-5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      isLatest ? 'bg-cyan-500' : 'bg-slate-300'
                    }`}
                  />
                  <EventCard event={event} isLatest={isLatest} />
                </li>
              );
            })}
          </ol>
          {data.nextCursor && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              nextCursor: <span className="font-mono">{data.nextCursor}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
