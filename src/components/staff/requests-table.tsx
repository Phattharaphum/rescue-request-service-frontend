'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { IncidentRequestSummary, PriorityLevel } from '@/types/rescue';
import { formatRequestType, formatPriorityLevel } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';

const PRIORITY_VARIANT_MAP: Record<PriorityLevel, 'gray' | 'blue' | 'amber' | 'red'> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'amber',
  CRITICAL: 'red',
};

interface RequestsTableProps {
  items: IncidentRequestSummary[];
  isLoading: boolean;
}

export function RequestsTable({ items, isLoading }: RequestsTableProps) {
  if (isLoading) {
    return <LoadingState message="กำลังโหลดรายการ..." />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="ไม่มีคำขอในขณะนี้"
        description="เมื่อมีคำขอช่วยเหลือ จะแสดงรายการที่นี่"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>รหัสคำขอ</TableHead>
          <TableHead>ประเภท</TableHead>
          <TableHead>สถานะ</TableHead>
          <TableHead>ผู้ติดต่อ</TableHead>
          <TableHead align="center">จำนวนคน</TableHead>
          <TableHead>ความเร่งด่วน</TableHead>
          <TableHead>หน่วยงาน</TableHead>
          <TableHead>ยื่นเมื่อ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.requestId}>
            <TableCell>
              <Link
                href={`/staff/requests/${item.requestId}`}
                className="font-mono text-xs text-teal-600 hover:text-teal-800 hover:underline flex items-center gap-1"
              >
                {item.requestId.slice(0, 8)}…
                <ExternalLink size={12} />
              </Link>
            </TableCell>
            <TableCell>
              <span className="text-sm">{formatRequestType(item.requestType)}</span>
            </TableCell>
            <TableCell>
              <StatusBadge status={item.status} size="sm" />
            </TableCell>
            <TableCell>
              <span className="text-sm">{item.contactName}</span>
            </TableCell>
            <TableCell align="center">
              <span className="text-sm font-medium">{item.peopleCount ?? '-'}</span>
            </TableCell>
            <TableCell>
              {item.priorityLevel ? (
                <Badge variant={PRIORITY_VARIANT_MAP[item.priorityLevel]} size="sm">
                  {formatPriorityLevel(item.priorityLevel)}
                </Badge>
              ) : (
                <span className="text-gray-400 text-sm">—</span>
              )}
            </TableCell>
            <TableCell>
              <span className="text-sm text-gray-600">
                {item.assignedUnitId ?? '—'}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDateTime(item.submittedAt)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

