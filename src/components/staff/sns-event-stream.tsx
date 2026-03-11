// src/components/staff/sns-event-stream.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Pause, Play, Trash2, Terminal, Info, Clock, 
  Loader2, X, ChevronDown, 
} from 'lucide-react';
import { useSnsStream } from '@/lib/hooks/use-sns-stream';
import { cn } from '@/lib/utils/cn';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date';
import { SnsStreamEvent } from '@/types/sns';

// ============================================================================
// INLINED UI COMPONENTS (ไม่ต้อง Import จากที่อื่น)
// ============================================================================

// --- 1. Badge ---
interface BadgeProps {
  variant?: 'gray' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}
function Badge({ variant = 'gray', size = 'sm', className, children }: BadgeProps) {
  const variants = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };
  return (
    <span className={cn('inline-flex items-center font-bold rounded-md border shadow-sm', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}

// --- 2. Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, children, className, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
      outline: 'border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100',
      ghost: 'text-gray-600 bg-transparent hover:bg-gray-100 active:bg-gray-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    };
    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
      md: 'h-10 px-4 text-sm gap-2 rounded-xl',
      lg: 'h-12 px-6 text-base gap-2 rounded-xl',
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant], sizes[size], className
        )}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin shrink-0" size={14} /> : leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// --- 3. Dialog ---
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}
function Dialog({ isOpen, onClose, title, size = 'md', children }: DialogProps) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !mounted) return null;

  const sizeClasses = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  const content = (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />
      <div className={cn('relative z-10 w-full bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]', sizeClasses[size])}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
  return createPortal(content, document.body);
}

// --- 4. Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}
function Select({ options, className, ...props }: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        className={cn(
          'block w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors',
          'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
        <ChevronDown size={14} />
      </div>
    </div>
  );
}

// --- 5. Switch ---
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}
function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          checked ? 'bg-blue-600' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
      {label && <span className="text-sm font-semibold text-gray-700">{label}</span>}
    </label>
  );
}

// --- 6. JsonViewer ---
function JsonViewer({ data }: { data: unknown }) {
  // สร้างตัวแสดงผล JSON แบบง่ายๆ สวยงาม (คล้ายๆ Code Editor)
  const formattedJson = JSON.stringify(data, null, 2);
  return (
    <div className="relative group rounded-xl bg-[#0d1117] p-4 text-[13px] leading-relaxed overflow-x-auto shadow-inner border border-gray-800 custom-scrollbar">
      <pre className="font-mono text-[#e6edf3]">
        <code dangerouslySetInnerHTML={{
          __html: formattedJson
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
              let cls = 'text-[#79c0ff]'; // String
              if (/^"/.test(match)) {
                if (/:$/.test(match)) cls = 'text-[#7ee787] font-semibold'; // Key
                else cls = 'text-[#a5d6ff]'; // Value String
              } else if (/true|false/.test(match)) cls = 'text-[#ff7b72]'; // Boolean
              else if (/null/.test(match)) cls = 'text-[#ff7b72]'; // Null
              else cls = 'text-[#d2a8ff]'; // Number
              return `<span class="${cls}">${match}</span>`;
            })
        }} />
      </pre>
    </div>
  );
}


// ============================================================================
// DOMAIN COMPONENTS & LOGIC
// ============================================================================

const EVENT_BADGE_COLORS: Record<string, string> = {
  'rescue-request.created': 'border-emerald-200 bg-emerald-100 text-emerald-800',
  'rescue-request.status-changed': 'border-blue-200 bg-blue-100 text-blue-800',
  'rescue-request.citizen-updated': 'border-amber-200 bg-amber-100 text-amber-800',
  'rescue-request.resolved': 'border-indigo-200 bg-indigo-100 text-indigo-800',
  'rescue-request.cancelled': 'border-red-200 bg-red-100 text-red-800',
  'raw-message': 'border-gray-300 bg-gray-200 text-gray-800',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  'rescue-request.created': 'สร้างคำขอใหม่',
  'rescue-request.status-changed': 'เปลี่ยนสถานะ',
  'rescue-request.citizen-updated': 'ผู้ประสบภัยอัปเดตข้อมูล',
  'rescue-request.resolved': 'ปิดงานสำเร็จ',
  'rescue-request.cancelled': 'ยกเลิกคำขอ',
  'raw-message': 'ข้อความดิบ (Raw Message)',
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
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-sm',
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

    if (previousStatus && newStatus) return `เปลี่ยนสถานะ: ${previousStatus} -> ${newStatus}`;
    if (newStatus) return `สถานะล่าสุด: ${newStatus}`;
  }

  if (eventType === 'rescue-request.citizen-updated') {
    const updateType = toStringValue(body.updateType);
    if (updateType) return `ข้อมูลที่อัปเดต: ${updateType}`;
  }

  if (eventType === 'rescue-request.created') {
    const data = asRecord(body.data);
    const requestType = toStringValue(data?.requestType ?? body.requestType);
    if (requestType) return `สร้างคำขอความช่วยเหลือใหม่ (${requestType})`;
    return 'สร้างคำขอความช่วยเหลือใหม่';
  }

  if (eventType === 'rescue-request.resolved') {
    return 'คำขอถูกดำเนินการเรียบร้อยแล้ว (ปิดงาน)';
  }

  if (eventType === 'rescue-request.cancelled') {
    return 'คำขอถูกยกเลิก';
  }

  if (toStringValue(body.newStatus)) return `สถานะใหม่: ${toStringValue(body.newStatus)}`;
  if (toStringValue(body.updateType)) return `ประเภทการอัปเดต: ${toStringValue(body.updateType)}`;

  return undefined;
}

function StatusDot({ status }: { status: string }) {
  if (status === 'connected') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        เชื่อมต่อเรียบร้อย
      </span>
    );
  }

  if (status === 'paused') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        หยุดชั่วคราว
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
      <span className="h-2 w-2 rounded-full bg-gray-400" />
      ขาดการเชื่อมต่อ
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
      {/* Control Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-gray-100 bg-white p-4">
        <StatusDot status={status} />

        <div className="flex flex-1 flex-wrap items-center gap-3 sm:justify-end">
          <div className="w-full sm:w-56">
            <Select
              options={EVENT_TYPE_OPTIONS}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 h-10 shadow-sm">
            <Switch
              checked={isAutoScroll}
              onChange={setAutoScroll}
              label="เลื่อนขึ้นอัตโนมัติ"
            />
          </div>

<div className="flex items-center gap-2">
            {status === 'connected' ? (
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<Pause size={14} />} 
                onClick={pause} 
                className="h-10 px-4"
                disabled // เพิ่ม disabled ตรงนี้
              >
                หยุด
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                leftIcon={<Play size={14} />} 
                onClick={resume} 
                className="h-10 px-4"
                disabled // เพิ่ม disabled ตรงนี้
              >
                เริ่ม
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              leftIcon={<Trash2 size={14} />} 
              onClick={clear} 
              className="h-10 px-3 text-gray-500 hover:text-red-600"
              disabled // เพิ่ม disabled ตรงนี้
            >
              ล้างจอ
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Badges */}
      {stats.total > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <Badge variant="gray" size="sm" className="bg-slate-800 text-white border-none shadow-sm">
            <Terminal size={12} className="mr-1" /> ทั้งหมด: {stats.total}
          </Badge>
          {Object.entries(stats.byType).map(([type, count]) => (
            <span
              key={type}
              className={cn(
                'inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold shadow-sm',
                EVENT_BADGE_COLORS[type] ?? 'border-gray-200 bg-white text-gray-700',
              )}
            >
              {(EVENT_TYPE_LABELS[type] ?? type)}: {count}
            </span>
          ))}
        </div>
      )}

      {/* Terminal View */}
      <div
        ref={listRef}
        className="h-125 space-y-2 overflow-y-auto rounded-2xl border border-slate-800 bg-[#0d1117] p-3 font-mono shadow-inner custom-scrollbar"
      >
        {filteredEvents.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 opacity-50">
            <Terminal size={48} className="text-slate-500" />
            <p className="text-sm font-medium text-slate-400">
              {status === 'connected' ? 'กำลังรอรับข้อมูล (Waiting for events...)' : 'ไม่มีข้อมูลแสดงผล'}
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
              className="group flex w-full flex-col gap-1.5 rounded-xl border border-slate-800/50 bg-[#161b22] px-4 py-3 text-left transition-all hover:border-slate-600 hover:bg-[#21262d] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="whitespace-nowrap text-[11px] text-slate-500 font-semibold tracking-wider">
                  [{formatRelativeTime(event._receivedAt)}]
                </span>
                <EventTypeBadge eventType={event.metadata.eventType} />
                {event.metadata.correlationId && (
                  <span className="ml-auto truncate text-[10px] text-slate-500">
                    corr: {event.metadata.correlationId.slice(0, 8)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 sm:pl-21.25 mt-1 sm:mt-0">
                <span className="text-[11px] text-slate-500">id:</span>
                <span className="truncate text-xs font-semibold text-[#79c0ff]">{event.metadata.eventId}</span>
              </div>

              {summary && (
                <div className="flex items-center gap-2 sm:pl-21.25 mt-1">
                  <span className="text-xs font-medium text-[#7ee787] truncate"> {summary}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Dialog
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="รายละเอียดเหตุการณ์ (Event Details)"
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Info size={12}/> ประเภทเหตุการณ์ (Type)</p>
                <div><EventTypeBadge eventType={selectedEvent.metadata.eventType} /></div>
              </div>
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Terminal size={12}/> Event ID</p>
                <p className="break-all font-mono text-xs font-bold text-blue-700 bg-white border border-blue-100 px-2 py-1 rounded-md">{selectedEvent.metadata.eventId}</p>
              </div>
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Clock size={12}/> เวลา (Timestamp)</p>
                <p className="text-sm font-semibold text-gray-900">{formatDateTime(selectedEvent.metadata.timestamp)}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-500">Partition Key</p>
                <p className="font-mono text-xs font-medium text-gray-900">{selectedEvent.metadata.partitionKey}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-500">แหล่งที่มา (Source)</p>
                <p className="text-xs font-medium text-gray-900 bg-white border border-gray-200 px-2 py-1 rounded-md inline-block">{selectedEvent.metadata.source}</p>
              </div>
              {selectedEvent.metadata.correlationId && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500">Correlation ID</p>
                  <p className="font-mono text-xs font-medium text-gray-900">{selectedEvent.metadata.correlationId}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Terminal size={16} /> 
                เนื้อหาข้อมูล (Payload Body)
              </p>
              <JsonViewer data={selectedEvent.body} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}