// src/components/citizen/citizen-updates-list.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
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
  const parsed = parseSpecialNeeds(value);
  const chips =
    parsed.mode === 'chip'
      ? (parsed.items ?? [])
      : parsed.text
        ? [parsed.text]
        : [];

  if (chips.length === 0) {
    return <span className="text-slate-500">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-700"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function PayloadSummary({
  updateType,
  payload,
}: {
  updateType: UpdateType;
  payload: Record<string, unknown>;
}) {
  switch (updateType) {
    case 'NOTE':
      return <span>{String(payload.note ?? '-')}</span>;

    case 'LOCATION_DETAILS':
      return <span>{String(payload.locationDetails ?? '-')}</span>;

    case 'PEOPLE_COUNT':
      return (
        <span>
          จำนวน <span className="font-black">{String(payload.peopleCount ?? '-')}</span> คน
        </span>
      );

    case 'SPECIAL_NEEDS':
      return <SpecialNeedsChips value={payload.specialNeeds} />;

    case 'CONTACT_INFO': {
      const contactName = payload.contactName ? String(payload.contactName) : '-';
      const contactPhone = payload.contactPhone ? String(payload.contactPhone) : '-';
      return (
        <div className="space-y-1">
          <p>ชื่อผู้ติดต่อ: {contactName}</p>
          <p>เบอร์โทรศัพท์: {contactPhone}</p>
        </div>
      );
    }

    default:
      return <span className="italic text-slate-400">-</span>;
  }
}

export function CitizenUpdatesList({ requestId }: CitizenUpdatesListProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['citizen-updates', requestId],
    queryFn: () => listCitizenUpdates(requestId, { limit: 50 }),
  });

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-cyan-700">Update history</p>
          <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">
            ประวัติการแจ้งข้อมูล
          </h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <MessageSquare size={22} />
        </div>
      </div>

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
        <div className="grid gap-3">
          {data.items.map((item) => (
            <div
              key={item.updateId}
              className="flex flex-col gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={UPDATE_TYPE_VARIANT[item.updateType] ?? 'gray'} size="sm">
                  {formatUpdateType(item.updateType)}
                </Badge>
                <span className="ml-auto text-xs font-bold text-slate-500">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>

              <div className="rounded-xl border border-cyan-100 bg-white p-3 text-sm font-semibold leading-6 text-slate-700">
                <PayloadSummary updateType={item.updateType} payload={item.updatePayload} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
