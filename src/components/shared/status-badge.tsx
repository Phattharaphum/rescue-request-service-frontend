'use client';
import { Badge } from '@/components/ui/badge';
import { RequestStatus } from '@/types/rescue';
import { formatStatus } from '@/lib/utils/format';

const STATUS_VARIANT_MAP: Record<RequestStatus, 'gray' | 'amber' | 'blue' | 'purple' | 'green' | 'red'> = {
  SUBMITTED: 'gray',
  TRIAGED: 'amber',
  ASSIGNED: 'blue',
  IN_PROGRESS: 'purple',
  RESOLVED: 'green',
  CANCELLED: 'red',
};

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function StatusBadge({ status, size = 'md', dot = false }: StatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT_MAP[status]} size={size} dot={dot}>
      {formatStatus(status)}
    </Badge>
  );
}
