'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { EmptyState } from '@/components/shared/empty-state';
import { listCitizenUpdates } from '@/lib/api/rescue';
import { formatUpdateType } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';
import { parseSpecialNeeds } from '@/lib/utils/special-needs';
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

function SpecialNeedsChips({ value }: { value: unknown }) {
  const parsed = parseSpecialNeeds(typeof value === 'string' ? value : '');
  const chips =
    parsed.mode === 'chip'
      ? (parsed.items ?? [])
      : parsed.text
        ? [parsed.text]
        : [];

  if (chips.length === 0) {
    return <span className="text-gray-500">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function PayloadSummary({ updateType, payload }: { updateType: UpdateType; payload: Record<string, unknown> }) {
  switch (updateType) {
    case 'NOTE':
      return <span className="text-gray-700">{String(payload.note ?? '-')}</span>;

    case 'LOCATION_DETAILS':
      return <span className="text-gray-700">{String(payload.locationDetails ?? '-')}</span>;

    case 'PEOPLE_COUNT':
      return (
        <span className="text-gray-700">
          จำนวน <span className="font-semibold">{String(payload.peopleCount ?? '-')}</span> คน
        </span>
      );

    case 'SPECIAL_NEEDS':
      return <SpecialNeedsChips value={payload.specialNeeds} />;

    case 'CONTACT_INFO': {
      const contactName = payload.contactName ? String(payload.contactName) : '-';
      const contactPhone = payload.contactPhone ? String(payload.contactPhone) : '-';
      return (
        <div className="space-y-1 text-gray-700">
          <p>ชื่อผู้ติดต่อ: {contactName}</p>
          <p>เบอร์โทรศัพท์: {contactPhone}</p>
        </div>
      );
    }

    default:
      return <span className="italic text-gray-400">-</span>;
  }
}

export function CitizenUpdatesList({ requestId }: CitizenUpdatesListProps) {

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['citizen-updates', requestId],
    queryFn: () => listCitizenUpdates(requestId, { limit: 50 }),
  });

  return (
    <Card>
      <CardHeader title="ประวัติการแจ้งข้อมูล" />
      <CardContent>
        {isLoading && <LoadingState message="กำลังโหลดประวัติ..." />}

        {error && <ErrorAlert message="ไม่สามารถโหลดประวัติได้" onRetry={() => refetch()} />}

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
                key={item.updateId}
                className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={UPDATE_TYPE_VARIANT[item.updateType] ?? 'gray'} size="sm">
                    {formatUpdateType(item.updateType)}
                  </Badge>
                  <span className="ml-auto text-xs text-gray-400">{formatDateTime(item.createdAt)}</span>
                </div>

                <div className="rounded-md border border-gray-200 bg-white p-2 text-sm">
                  <PayloadSummary updateType={item.updateType} payload={item.updatePayload} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
