'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { EmptyState } from '@/components/shared/empty-state';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { listCitizenUpdates } from '@/lib/api/rescue';
import { formatUpdateType } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';
import { UpdateType } from '@/types/rescue';

const UPDATE_TYPE_VARIANT: Record<UpdateType, 'gray' | 'blue' | 'amber' | 'green' | 'purple'> = {
  NOTE: 'gray',
  LOCATION_DETAILS: 'blue',
  PEOPLE_COUNT: 'amber',
  SPECIAL_NEEDS: 'green',
  CONTACT_INFO: 'purple',
};

interface CitizenUpdatesListProps {
  requestId: string;
}

function PayloadSummary({ updateType, payload }: { updateType: UpdateType; payload: Record<string, unknown> }) {
  switch (updateType) {
    case 'NOTE':
      return <span className="text-gray-600">{String(payload.note ?? '')}</span>;
    case 'LOCATION_DETAILS':
      return <span className="text-gray-600">{String(payload.locationDetails ?? '')}</span>;
    case 'PEOPLE_COUNT':
      return <span className="text-gray-600">จำนวน {String(payload.peopleCount ?? '')} คน</span>;
    case 'SPECIAL_NEEDS':
      return <span className="text-gray-600">{String(payload.specialNeeds ?? '')}</span>;
    case 'CONTACT_INFO': {
      const parts: string[] = [];
      if (payload.contactName) parts.push(String(payload.contactName));
      if (payload.contactPhone) parts.push(String(payload.contactPhone));
      return <span className="text-gray-600">{parts.join(' / ')}</span>;
    }
    default:
      return <span className="text-gray-400 italic">—</span>;
  }
}

export function CitizenUpdatesList({ requestId }: CitizenUpdatesListProps) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [prevCursors, setPrevCursors] = useState<string[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['citizen-updates', requestId, cursor],
    queryFn: () => listCitizenUpdates(requestId, { cursor, limit: 10 }),
  });

  const handleNext = () => {
    if (data?.nextCursor) {
      setPrevCursors((prev) => [...prev, cursor ?? '']);
      setCursor(data.nextCursor);
    }
  };

  const handlePrev = () => {
    const prev = prevCursors[prevCursors.length - 1];
    setPrevCursors((p) => p.slice(0, -1));
    setCursor(prev === '' ? undefined : prev);
  };

  return (
    <Card>
      <CardHeader title="ประวัติการแจ้งข้อมูล" />
      <CardContent>
        {isLoading && <LoadingState message="กำลังโหลดประวัติ..." />}
        {error && (
          <ErrorAlert
            message="ไม่สามารถโหลดประวัติได้"
            onRetry={() => refetch()}
          />
        )}
        {!isLoading && !error && data?.items.length === 0 && (
          <EmptyState
            icon={<MessageSquare size={32} />}
            title="ยังไม่มีการอัปเดต"
            description="เมื่อคุณส่งข้อมูลเพิ่มเติม จะแสดงที่นี่"
          />
        )}
        {!isLoading && data && data.items.length > 0 && (
          <div className="space-y-3">
            {data.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 p-3 rounded-lg border border-gray-100 bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={UPDATE_TYPE_VARIANT[item.updateType] ?? 'gray'}
                    size="sm"
                  >
                    {formatUpdateType(item.updateType)}
                  </Badge>
                  <span className="ml-auto text-xs text-gray-400">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-sm mt-1">
                  <PayloadSummary
                    updateType={item.updateType}
                    payload={item.updatePayload}
                  />
                </p>
              </div>
            ))}

            <PaginationControls
              nextCursor={data.nextCursor}
              onNext={handleNext}
              onPrev={handlePrev}
              isLoading={isLoading}
              hasPrev={prevCursors.length > 0}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
