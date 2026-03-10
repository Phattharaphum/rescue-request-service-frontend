'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Trash2,
  ArrowDownToLine,
  Filter,
  Wifi,
  WifiOff,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { JsonViewer } from '@/components/shared/json-viewer';
import { useSnsStream } from '@/lib/hooks/use-sns-stream';
import { SnsStreamEvent, PublishedEventType } from '@/types/sns';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

const EVENT_BADGE_COLORS: Record<string, string> = {
  'rescue-request.created': 'bg-green-100 text-green-800 border-green-200',
  'rescue-request.status-changed': 'bg-blue-100 text-blue-800 border-blue-200',
  'rescue-request.citizen-updated': 'bg-orange-100 text-orange-800 border-orange-200',
  'rescue-request.resolved': 'bg-teal-100 text-teal-800 border-teal-200',
  'rescue-request.cancelled': 'bg-red-100 text-red-800 border-red-200',
};

const EVENT_TYPE_OPTIONS = [
  { value: '', label: 'ทุกประเภท' },
  { value: 'rescue-request.created', label: 'สร้างคำขอ' },
  { value: 'rescue-request.status-changed', label: 'เปลี่ยนสถานะ' },
  { value: 'rescue-request.citizen-updated', label: 'ผู้ประสบภัยอัปเดต' },
  { value: 'rescue-request.resolved', label: 'เสร็จสิ้น' },
  { value: 'rescue-request.cancelled', label: 'ยกเลิก' },
];

function EventTypeBadge({ eventType }: { eventType: string }) {
  const colorClass = EVENT_BADGE_COLORS[eventType] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  const shortLabel = eventType.replace('rescue-request.', '');
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        colorClass,
      )}
    >
      {shortLabel}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  if (status === 'connected') {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        เชื่อมต่อแล้ว
      </span>
    );
  }
  if (status === 'paused') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-600">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        หยุดชั่วคราว
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <span className="w-2 h-2 rounded-full bg-gray-400" />
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
    ? events.filter((e) => e.metadata.eventType === filterType)
    : events;

  useEffect(() => {
    if (isAutoScroll && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events, isAutoScroll]);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
        <StatusDot status={status} />

        <div className="flex items-center gap-2 ml-auto">
          <div className="w-44">
            <Select
              options={EVENT_TYPE_OPTIONS}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              placeholder="กรองตามประเภท"
            />
          </div>

          <Switch
            checked={isAutoScroll}
            onChange={setAutoScroll}
            label="Auto-scroll"
            size="sm"
          />

          {status === 'connected' ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Pause size={14} />}
              onClick={pause}
            >
              หยุด
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Play size={14} />}
              onClick={resume}
            >
              เริ่ม
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={clear}
          >
            ล้าง
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="gray" size="sm">
            ทั้งหมด: {stats.total}
          </Badge>
          {Object.entries(stats.byType).map(([type, count]) => (
            <span
              key={type}
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                EVENT_BADGE_COLORS[type] ?? 'bg-gray-100 text-gray-700 border-gray-200',
              )}
            >
              {type.replace('rescue-request.', '')}: {count}
            </span>
          ))}
        </div>
      )}

      {/* Event List */}
      <div
        ref={listRef}
        className="h-96 overflow-y-auto rounded-xl border border-gray-200 bg-gray-900 p-2 space-y-1 font-mono"
      >
        {filteredEvents.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">
              {status === 'connected' ? 'รอรับ events...' : 'ไม่มีข้อมูล'}
            </p>
          </div>
        )}
        {filteredEvents.map((event) => (
          <button
            key={event._id}
            type="button"
            onClick={() => setSelectedEvent(event)}
            className="w-full text-left flex flex-col gap-0.5 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs whitespace-nowrap">
                {formatRelativeTime(event._receivedAt)}
              </span>
              <EventTypeBadge eventType={event.metadata.eventType} />
              {event.metadata.correlationId && (
                <span className="text-gray-500 text-xs truncate ml-auto">
                  {event.metadata.correlationId.slice(0, 8)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">id:</span>
              <span className="text-gray-300 text-xs font-mono truncate">
                {event.metadata.eventId}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Event Detail Dialog */}
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
                <p className="font-mono text-xs break-all">{selectedEvent.metadata.eventId}</p>
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
              <p className="text-xs text-gray-500 mb-1">Body</p>
              <JsonViewer data={selectedEvent.body} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
