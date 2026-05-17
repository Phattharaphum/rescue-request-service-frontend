'use client';

import Link from 'next/link';
import { Activity, ClipboardList, ExternalLink, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { IncidentRequestSummary, PriorityLevel } from '@/types/rescue';
import { formatPriorityLevel, formatRequestType } from '@/lib/utils/format';
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

function SkeletonCell({ className = '' }: { className?: string }) {
  return <div className={`h-4 animate-pulse rounded-full bg-slate-200 ${className}`} />;
}

function RequestsTableLoading() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700">
              <span className="absolute h-8 w-8 animate-ping rounded-full bg-cyan-200/60" />
              <Activity size={23} className="relative animate-pulse" />
            </div>
            <div>
              <p className="text-base font-black text-slate-950">กำลังโหลดรายการคำขอ</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                กำลังซิงก์ข้อมูลจากเหตุการณ์ภัยพิบัติที่เลือก
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:w-56">
            <span className="h-2 animate-pulse rounded-full bg-cyan-300" />
            <span className="h-2 animate-pulse rounded-full bg-amber-300 [animation-delay:120ms]" />
            <span className="h-2 animate-pulse rounded-full bg-emerald-400 [animation-delay:240ms]" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[1.1fr_1.4fr_1fr_1.1fr_0.7fr_1fr_1fr_1.3fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
            {['รหัสคำขอ', 'ประเภท', 'สถานะ', 'ผู้ติดต่อ', 'จำนวน', 'เร่งด่วน', 'หน่วยงาน', 'เวลาที่แจ้ง'].map(
              (heading) => (
                <span key={heading} className="text-xs font-black uppercase text-slate-400">
                  {heading}
                </span>
              ),
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[1.1fr_1.4fr_1fr_1.1fr_0.7fr_1fr_1fr_1.3fr] items-center gap-4 px-4 py-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <ClipboardList size={15} />
                  </span>
                  <SkeletonCell className="w-20" />
                </div>
                <SkeletonCell className="w-36" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-blue-100" />
                <SkeletonCell className="w-28" />
                <SkeletonCell className="mx-auto w-10" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-amber-100" />
                <SkeletonCell className="w-24" />
                <SkeletonCell className="w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RequestsTable({ items, isLoading }: RequestsTableProps) {
  if (isLoading) {
    return <RequestsTableLoading />;
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
        <TableHeader className="border-b border-slate-200 bg-slate-50">
          <TableRow>
            <TableHead className="whitespace-nowrap font-black text-slate-700">รหัสคำขอ</TableHead>
            <TableHead className="whitespace-nowrap font-black text-slate-700">ประเภท</TableHead>
            <TableHead className="whitespace-nowrap font-black text-slate-700">สถานะล่าสุด</TableHead>
            <TableHead className="whitespace-nowrap font-black text-slate-700">ผู้ติดต่อ</TableHead>
            <TableHead align="center" className="whitespace-nowrap font-black text-slate-700">
              จำนวน
            </TableHead>
            <TableHead className="whitespace-nowrap font-black text-slate-700">ความเร่งด่วน</TableHead>
            <TableHead className="whitespace-nowrap font-black text-slate-700">หน่วยงาน</TableHead>
            <TableHead className="whitespace-nowrap font-black text-slate-700">เวลาที่แจ้ง</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100">
          {items.map((item) => (
            <TableRow key={item.requestId} className="transition-colors hover:bg-cyan-50/50">
              <TableCell>
                <Link
                  href={`/admin/incident/requests/${item.requestId}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-2.5 py-1 font-mono text-sm font-black text-cyan-700 transition-colors hover:bg-cyan-100"
                  title="ดูรายละเอียดคำขอ"
                >
                  {item.requestId.slice(0, 8)}
                  <ExternalLink size={14} />
                </Link>
              </TableCell>
              <TableCell>
                <span className="whitespace-nowrap text-sm font-bold text-slate-900">
                  {formatRequestType(item.requestType)}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <StatusBadge status={item.status} size="sm" />
              </TableCell>
              <TableCell>
                <span className="whitespace-nowrap text-sm font-bold text-slate-800">
                  {item.contactName}
                </span>
              </TableCell>
              <TableCell align="center">
                <div className="inline-flex items-center gap-1.5 text-sm font-black text-slate-700">
                  <Users size={14} className="text-slate-400" />
                  {item.peopleCount ?? '-'}
                </div>
              </TableCell>
              <TableCell>
                {item.priorityLevel ? (
                  <Badge
                    variant={PRIORITY_VARIANT_MAP[item.priorityLevel]}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {formatPriorityLevel(item.priorityLevel)}
                  </Badge>
                ) : (
                  <span className="text-sm font-bold text-slate-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <span className="whitespace-nowrap text-sm font-bold text-slate-600">
                  {item.assignedUnitId ?? <span className="text-slate-400">-</span>}
                </span>
              </TableCell>
              <TableCell>
                <span className="whitespace-nowrap text-sm font-semibold text-slate-500">
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
