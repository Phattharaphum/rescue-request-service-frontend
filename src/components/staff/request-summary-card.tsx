// src\components\staff\request-summary-card.tsx
'use client';

import Link from 'next/link';
import { ExternalLink, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { IncidentRequestSummary } from '@/types/rescue';
import { formatRequestType } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';

interface RequestSummaryCardProps {
  item: IncidentRequestSummary;
}

export function RequestSummaryCard({ item }: RequestSummaryCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-2 py-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/staff/requests/${item.requestId}`}
              className="font-mono text-xs text-teal-600 hover:text-teal-800 hover:underline flex items-center gap-1"
            >
              {item.requestId.slice(0, 12)}…
              <ExternalLink size={12} />
            </Link>
            <StatusBadge status={item.status} size="sm" dot />
          </div>

          <p className="text-sm font-medium text-gray-900">{formatRequestType(item.requestType)}</p>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {item.contactName}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {item.peopleCount ?? '-'} คน
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} />
            <span>{formatDateTime(item.submittedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

