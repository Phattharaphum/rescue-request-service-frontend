'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { EmptyState } from '@/components/shared/empty-state';import { StatusBadge } from '@/components/shared/status-badge';
import { listRequestEvents } from '@/lib/api/rescue';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date';
import { StatusEvent } from '@/types/rescue';

interface EventsListProps {
  requestId: string;
}

function EventDetails({ event }: { event: StatusEvent }) {
  return (
    <div className="mt-1 space-y-1">
      {event.previousStatus && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">จาก:</span>
          <StatusBadge status={event.previousStatus} size="sm" />
          <span className="text-gray-400">→</span>
          <StatusBadge status={event.newStatus} size="sm" />
        </div>
      )}
      {event.changedBy && (
        <p className="text-xs text-gray-500">
          ดำเนินการโดย: <span className="font-medium text-gray-700">{event.changedBy}</span>
          {event.changedByRole && (
            <span className="ml-1 text-gray-400">({event.changedByRole})</span>
          )}
        </p>
      )}
      {event.responderUnitId && (
        <p className="text-xs text-gray-500">
          หน่วยงาน: <span className="font-medium text-gray-700">{event.responderUnitId}</span>
        </p>
      )}
      {event.changeReason && (
        <p className="text-xs text-gray-500">
          เหตุผล: <span className="text-gray-700">{event.changeReason}</span>
        </p>
      )}
      {event.note && (
        <p className="text-xs text-gray-600 italic">{event.note}</p>
      )}
    </div>
  );
}

const STATUS_COLOR_MAP: Record<string, string> = {
  SUBMITTED: 'bg-gray-100 text-gray-600',
  TRIAGED: 'bg-amber-100 text-amber-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
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
    <Card className="border-gray-200">
      <CardHeader
        title="ประวัติสถานะ"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleOrder}
            leftIcon={order === 'DESC' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
          >
            {order === 'DESC' ? 'ใหม่สุดก่อน' : 'เก่าสุดก่อน'}
          </Button>
        }
      />
      <CardContent>
        {isLoading && <LoadingState message="กำลังโหลดประวัติ..." />}
        {error && (
          <ErrorAlert
            message="ไม่สามารถโหลดประวัติได้"
            onRetry={() => refetch()}
          />
        )}
        {!isLoading && !error && data?.items.length === 0 && (
          <EmptyState title="ยังไม่มีประวัติสถานะ" />
        )}
        {!isLoading && data && data.items.length > 0 && (
          <div className="space-y-4">
            <ol className="relative">
              {data.items.map((event, index) => {
                const isLast = index === data.items.length - 1;
                return (
                  <li
                    key={event.eventId}
                    className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-6 last:pb-0"
                  >
                    {!isLast && (
                      <span
                        className="absolute left-[0.95rem] top-9 h-[calc(100%-2.25rem)] w-px bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div
                      className={`relative z-10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${STATUS_COLOR_MAP[event.newStatus] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {event.version}
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={event.newStatus} size="sm" />
                        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                          {formatRelativeTime(event.occurredAt)}
                        </span>
                      </div>
                      <EventDetails event={event} />
                      <time className="mt-1 block text-xs text-gray-400">
                        {formatDateTime(event.occurredAt)}
                      </time>
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

