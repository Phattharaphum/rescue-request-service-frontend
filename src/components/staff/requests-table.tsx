// src/components/staff/requests-table.tsx
'use client';

import Link from 'next/link';
import { ExternalLink, Users } from 'lucide-react';
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

function RequestsTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead>รหัสคำขออ้างอิง</TableHead>
            <TableHead>ประเภทความช่วยเหลือ</TableHead>
            <TableHead>สถานะล่าสุด</TableHead>
            <TableHead>ชื่อผู้ติดต่อ</TableHead>
            <TableHead align="center">ผู้ประสบภัย</TableHead>
            <TableHead>ความเร่งด่วน</TableHead>
            <TableHead>หน่วยปฏิบัติการ</TableHead>
            <TableHead>เวลาที่แจ้งคำขอ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, idx) => (
            <TableRow key={`skeleton-${idx}`}>
              {Array.from({ length: 8 }).map((__, colIdx) => (
                <TableCell key={`skeleton-${idx}-${colIdx}`}>
                  <div className="h-5 w-full animate-pulse rounded-md bg-gray-100" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function RequestsTable({ items, isLoading }: RequestsTableProps) {
  if (isLoading) {
    return <RequestsTableSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          title="ไม่มีคำขอความช่วยเหลือ"
          description="ยังไม่มีคำขอที่ตรงกับเงื่อนไขการค้นหาในขณะนี้"
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50/80 border-b border-gray-200">
          <TableRow>
            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">รหัสคำขออ้างอิง</TableHead>
            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">ประเภท</TableHead>
            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">สถานะล่าสุด</TableHead>
            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">ผู้ติดต่อ</TableHead>
            <TableHead align="center" className="font-semibold text-gray-700 whitespace-nowrap">จำนวน (คน)</TableHead>
            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">ความเร่งด่วน</TableHead>
            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">หน่วยงานที่รับผิดชอบ</TableHead>
            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">เวลาที่แจ้ง</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100">
          {items.map((item) => (
            <TableRow key={item.requestId} className="hover:bg-blue-50/30 transition-colors">
              <TableCell>
                <Link
                  href={`/staff/requests/${item.requestId}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 font-mono text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 hover:text-blue-900"
                  title="ดูรายละเอียดคำขอ"
                >
                  {item.requestId.slice(0, 8)}
                  <ExternalLink size={14} className="opacity-70" />
                </Link>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{formatRequestType(item.requestType)}</span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <StatusBadge status={item.status} size="sm" />
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{item.contactName}</span>
              </TableCell>
              <TableCell align="center">
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <Users size={14} className="text-gray-400" />
                  {item.peopleCount ?? '-'}
                </div>
              </TableCell>
              <TableCell>
                {item.priorityLevel ? (
                  <Badge variant={PRIORITY_VARIANT_MAP[item.priorityLevel]} size="sm" className="whitespace-nowrap">
                    {formatPriorityLevel(item.priorityLevel)}
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-400">—</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  {item.assignedUnitId ?? <span className="text-gray-400">—</span>}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                  {formatDateTime(item.submittedAt)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}