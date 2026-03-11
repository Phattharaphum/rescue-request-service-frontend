'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { JsonViewer } from '@/components/shared/json-viewer';
import { useSnsStream } from '@/lib/hooks/use-sns-stream';
import { cn } from '@/lib/utils/cn';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date';
import { SnsStreamEvent } from '@/types/sns';

const EVENT_BADGE_COLORS: Record<string, string> = {
  'rescue-request.created': 'border-green-200 bg-green-100 text-green-800',
  'rescue-request.status-changed': 'border-blue-200 bg-blue-100 text-blue-800',
  'rescue-request.citizen-updated': 'border-orange-200 bg-orange-100 text-orange-800',
  'rescue-request.resolved': 'border-teal-200 bg-teal-100 text-teal-800',
  'rescue-request.cancelled': 'border-red-200 bg-red-100 text-red-800',
  'raw-message': 'border-gray-200 bg-gray-100 text-gray-700',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  'rescue-request.created': 'สร้างคำร้องใหม่',
  'rescue-request.status-changed': 'เปลี่ยนสถานะ',
  'rescue-request.citizen-updated': 'ผู้ประสบภัยอัปเดตข้อมูล',
  'rescue-request.resolved': 'ปิดงานสำเร็จ',
  'rescue-request.cancelled': 'ยกเลิกคำร้อง',
  'raw-message': 'ข้อความดิบ',
};

const EVENT_TYPE_OPTIONS = [
  { value: '', label: 'ทุกประเภท' },
  { value: 'rescue-request.created', label: EVENT_TYPE_LABELS['rescue-request.created'] },
  { value: 'rescue-request.status-changed', label: EVENT_TYPE_LABELS['rescue-request.status-changed'] },
  { value: 'rescue-request.citizen-updated', label: EVENT_TYPE_LABELS['rescue-request.citizen-updated'] },
  { value: 'rescue-request.resolved', label: EVENT_TYPE_LABELS['rescue-request.resolved'] },
  { value: 'rescue-request.cancelled', label: EVENT_TYPE_LABELS['rescue-request.cancelled'] },
  { value: 'raw-message', label: EVENT_TYPE_LABELS['raw-message'] },
];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function EventTypeBadge({ eventType }: { eventType: string }) {
  const colorClass = EVENT_BADGE_COLORS[eventType] ?? 'border-gray-200 bg-gray-100 text-gray-700';
  const label = EVENT_TYPE_LABELS[eventType] ?? eventType;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        colorClass,
      )}
    >
      {label}
    </span>
  );
}

function getEventSummary(event: SnsStreamEvent): string | undefined {
  const body = asRecord(event.body);
  if (!body) return undefined;

  const eventType = event.metadata.eventType;

  if (eventType === 'rescue-request.status-changed') {
    const previousStatus = toStringValue(body.previousStatus);
    const newStatus = toStringValue(body.newStatus);

    if (previousStatus && newStatus) return `สถานะ: ${previousStatus} -> ${newStatus}`;
    if (newStatus) return `สถานะใหม่: ${newStatus}`;
  }

  if (eventType === 'rescue-request.citizen-updated') {
    const updateType = toStringValue(body.updateType);
    if (updateType) return `รูปแบบอัปเดต: ${updateType}`;
  }

  if (eventType === 'rescue-request.created') {
    const data = asRecord(body.data);
    const requestType = toStringValue(data?.requestType ?? body.requestType);
    if (requestType) return `สร้างคำร้องใหม่ (${requestType})`;
    return 'สร้างคำร้องใหม่';
  }

  if (eventType === 'rescue-request.resolved') {
    return 'คำร้องถูกปิดงานแล้ว';
  }

  if (eventType === 'rescue-request.cancelled') {
    return 'คำร้องถูกยกเลิกแล้ว';
  }

  if (toStringValue(body.newStatus)) {
    return `สถานะใหม่: ${toStringValue(body.newStatus)}`;
  }

  if (toStringValue(body.updateType)) {
    return `รูปแบบอัปเดต: ${toStringValue(body.updateType)}`;
  }

  return undefined;
}

function StatusDot({ status }: { status: string }) {
  if (status === 'connected') {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
        เชื่อมต่อแล้ว
      </span>
    );
  }

  if (status === 'paused') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-600">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        หยุดชั่วคราว
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <span className="h-2 w-2 rounded-full bg-gray-400" />
      ไม่ได้เชื่อมต่อ
    </span>
  );
}

interface SnsEventStreamProps {
  mode?: 'mock' | 'sse';
  sseUrl?: string;
}

export function SnsEventStream({ mode = 'mock', sseUrl }: SnsEventStreamProps) {
  const { events, status, stats, pause, resume, clear, isAutoScroll, setAutoScroll } =
    useSnsStream({ mode, sseUrl, autoStart: true });

  const [filterType, setFilterType] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<SnsStreamEvent | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredEvents = filterType
    ? events.filter((event) => event.metadata.eventType === filterType)
    : events;

  useEffect(() => {
    if (isAutoScroll && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events, isAutoScroll]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
        <StatusDot status={status} />

        <div className="ml-auto flex items-center gap-2">
          <div className="w-52">
            <Select
              options={EVENT_TYPE_OPTIONS}
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              placeholder="กรองตามประเภท"
            />
          </div>

          <Switch
            checked={isAutoScroll}
            onChange={setAutoScroll}
            label="เลื่อนไปบนสุดอัตโนมัติ"
            size="sm"
          />

          {status === 'connected' ? (
            <Button variant="outline" size="sm" leftIcon={<Pause size={14} />} onClick={pause}>
              หยุด
            </Button>
          ) : (
            <Button variant="primary" size="sm" leftIcon={<Play size={14} />} onClick={resume}>
              เริ่ม
            </Button>
          )}

          <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={clear}>
            ล้าง
          </Button>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="gray" size="sm">
            ทั้งหมด: {stats.total}
          </Badge>
          {Object.entries(stats.byType).map(([type, count]) => (
            <span
              key={type}
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                EVENT_BADGE_COLORS[type] ?? 'border-gray-200 bg-gray-100 text-gray-700',
              )}
            >
              {(EVENT_TYPE_LABELS[type] ?? type)}: {count}
            </span>
          ))}
        </div>
      )}

      <div
        ref={listRef}
        className="h-96 space-y-1 overflow-y-auto rounded-xl border border-gray-200 bg-gray-900 p-2 font-mono"
      >
        {filteredEvents.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">
              {status === 'connected' ? 'รอรับ events...' : 'ไม่มีข้อมูล'}
            </p>
          </div>
        )}

        {filteredEvents.map((event) => {
          const summary = getEventSummary(event);

          return (
            <button
              key={event._id}
              type="button"
              onClick={() => setSelectedEvent(event)}
              className="group flex w-full flex-col gap-0.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-xs text-gray-400">
                  {formatRelativeTime(event._receivedAt)}
                </span>
                <EventTypeBadge eventType={event.metadata.eventType} />
                {event.metadata.correlationId && (
                  <span className="ml-auto truncate text-xs text-gray-500">
                    {event.metadata.correlationId.slice(0, 8)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">id:</span>
                <span className="truncate font-mono text-xs text-gray-300">{event.metadata.eventId}</span>
              </div>

              {summary && <p className="truncate text-xs text-emerald-300">{summary}</p>}
            </button>
          );
        })}
      </div>

      <Dialog
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="รายละเอียด Event"
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">ประเภท</p>
                <EventTypeBadge eventType={selectedEvent.metadata.eventType} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Event ID</p>
                <p className="break-all font-mono text-xs">{selectedEvent.metadata.eventId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">เวลา</p>
                <p className="text-xs">{formatDateTime(selectedEvent.metadata.timestamp)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Partition Key</p>
                <p className="font-mono text-xs">{selectedEvent.metadata.partitionKey}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="text-xs">{selectedEvent.metadata.source}</p>
              </div>
              {selectedEvent.metadata.correlationId && (
                <div>
                  <p className="text-xs text-gray-500">Correlation ID</p>
                  <p className="font-mono text-xs">{selectedEvent.metadata.correlationId}</p>
                </div>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500">Body</p>
              <JsonViewer data={selectedEvent.body} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
