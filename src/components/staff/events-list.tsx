// src/components/staff/events-list.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { listRequestEvents } from '@/lib/api/rescue';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date';
import { StatusEvent } from '@/types/rescue';

interface EventsListProps {
  requestId: string;
}

function EventDetails({ event }: { event: StatusEvent }) {
  return (
    <div className="mt-2.5 space-y-1.5 rounded-lg bg-white p-3 border border-gray-100 shadow-sm">
      {event.previousStatus && (
        <div className="flex items-center gap-2 text-xs pb-1.5 border-b border-gray-50">
          <span className="text-gray-400 font-medium">เปลี่ยนจาก:</span>
          <StatusBadge status={event.previousStatus} size="sm" />
          <span className="text-gray-300">→</span>
          <StatusBadge status={event.newStatus} size="sm" />
        </div>
      )}
      {event.changedBy && (
        <p className="text-xs text-gray-500 pt-1">
          ผู้ทำรายการ: <span className="font-semibold text-gray-800">{event.changedBy}</span>
          {event.changedByRole && (
            <span className="ml-1 text-gray-400">({event.changedByRole})</span>
          )}
        </p>
      )}
      {event.responderUnitId && (
        <p className="text-xs text-gray-500">
          มอบหมายทีม: <span className="font-semibold text-blue-700">{event.responderUnitId}</span>
        </p>
      )}
      {event.changeReason && (
        <p className="text-xs text-gray-500">
          เหตุผล: <span className="font-medium text-gray-800">{event.changeReason}</span>
        </p>
      )}
      {event.note && (
        <p className="text-xs text-gray-600 italic bg-amber-50 p-2 rounded border border-amber-100 mt-1.5 leading-relaxed">
          &quot;{event.note}&quot;
        </p>
      )}
    </div>
  );
}

const STATUS_COLOR_MAP: Record<string, string> = {
  SUBMITTED: 'bg-gray-100 text-gray-600 border-gray-200',
  TRIAGED: 'bg-amber-100 text-amber-700 border-amber-200',
  ASSIGNED: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-purple-100 text-purple-700 border-purple-200',
  RESOLVED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

export function EventsList({ requestId }: EventsListProps) {
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['events', requestId, order],
    queryFn: () => listRequestEvents(requestId, { limit: 50, order }),
  });

  const toggleOrder = () => {
    setOrder((o) => (o === 'DESC' ? 'ASC' : 'DESC'));
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader
        title="ประวัติการดำเนินการ (Timeline)"
        className="border-b border-gray-100 pb-4"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={toggleOrder}
            className="rounded-xl border-gray-200 bg-white shadow-sm"
            leftIcon={order === 'DESC' ? <ArrowDown size={14} className="text-blue-600"/> : <ArrowUp size={14} className="text-blue-600"/>}
          >
            {order === 'DESC' ? 'ล่าสุดก่อน' : 'เก่าสุดก่อน'}
          </Button>
        }
      />
      <CardContent className="pt-6">
        {isLoading && <LoadingState message="กำลังโหลดประวัติ..." />}
        {error && (
          <ErrorAlert
            message="ไม่สามารถเชื่อมต่อเพื่อโหลดประวัติได้"
            onRetry={() => refetch()}
          />
        )}
        {!isLoading && !error && data?.items.length === 0 && (
          <EmptyState title="ยังไม่มีประวัติการดำเนินการ" />
        )}
        {!isLoading && data && data.items.length > 0 && (
          <div className="space-y-4">
            <ol className="relative pl-2">
              {data.items.map((event, index) => {
                const isLast = index === data.items.length - 1;
                return (
                  <li
                    key={event.eventId}
                    className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 pb-8 last:pb-2"
                  >
                    {!isLast && (
                      <span
                        className="absolute left-[1.15rem] top-10 h-[calc(100%-2.5rem)] w-px border-l-2 border-dashed border-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div
                      className={`relative z-10 mt-1 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold border-2 shadow-sm ${STATUS_COLOR_MAP[event.newStatus] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
                      title={`เวอร์ชัน ${event.version}`}
                    >
                      v{event.version}
                    </div>
                    <div className="min-w-0 pt-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <StatusBadge status={event.newStatus} size="sm" />
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <Clock size={12} className="text-gray-400" />
                          <span className="whitespace-nowrap">{formatRelativeTime(event.occurredAt)}</span>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <time className="hidden sm:inline whitespace-nowrap">{formatDateTime(event.occurredAt)}</time>
                        </div>
                      </div>
                      <EventDetails event={event} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}