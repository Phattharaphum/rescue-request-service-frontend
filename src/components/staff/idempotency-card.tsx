'use client';

import { Hash, Clock, Tag, CheckSquare, FileJson } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoItem } from '@/components/shared/info-item';
import { JsonViewer } from '@/components/shared/json-viewer';
import { IdempotencyRecordResponse } from '@/types/rescue';
import { formatDateTime } from '@/lib/utils/date';

const STATUS_VARIANT: Record<string, 'gray' | 'blue' | 'green' | 'red' | 'amber'> = {
  PENDING: 'blue',
  COMPLETED: 'green',
  FAILED: 'red',
  EXPIRED: 'gray',
};

interface IdempotencyCardProps {
  data: IdempotencyRecordResponse;
}

export function IdempotencyCard({ data }: IdempotencyCardProps) {
  return (
    <Card>
      <CardHeader title="บันทึก Idempotency" />
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <InfoItem
              icon={<Hash size={14} />}
              label="Key Hash"
              value={<span className="font-mono text-xs break-all">{data.keyHash}</span>}
            />
          </div>
          {data.requestId && (
            <InfoItem
              icon={<Tag size={14} />}
              label="รหัสคำขอ"
              value={<span className="font-mono text-xs">{data.requestId}</span>}
            />
          )}
          <InfoItem
            icon={<CheckSquare size={14} />}
            label="สถานะ"
            value={
              <Badge variant={STATUS_VARIANT[data.status] ?? 'gray'} size="sm">
                {data.status}
              </Badge>
            }
          />
          <InfoItem
            icon={<Clock size={14} />}
            label="สร้างเมื่อ"
            value={formatDateTime(data.createdAt)}
          />
          {data.expiresAt && (
            <InfoItem
              icon={<Clock size={14} />}
              label="หมดอายุเมื่อ"
              value={formatDateTime(data.expiresAt)}
            />
          )}
          {data.requestFingerprint && (
            <div className="sm:col-span-2">
              <InfoItem
                label="Request Fingerprint"
                value={
                  <span className="font-mono text-xs break-all">
                    {data.requestFingerprint}
                  </span>
                }
              />
            </div>
          )}
          {data.response && (
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 mb-1">Response</p>
              <JsonViewer data={data.response} collapsed />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
