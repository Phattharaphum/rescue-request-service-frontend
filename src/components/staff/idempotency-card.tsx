'use client';

import { Hash, Clock, Tag, CheckSquare } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoItem } from '@/components/shared/info-item';
import { JsonViewer } from '@/components/shared/json-viewer';
import { IdempotencyRecordResponse } from '@/types/rescue';
import { formatDateTime } from '@/lib/utils/date';

const STATUS_VARIANT: Record<string, 'gray' | 'blue' | 'green' | 'red' | 'amber'> = {
  IN_PROGRESS: 'blue',
  COMPLETED: 'green',
  FAILED: 'red',
};

interface IdempotencyCardProps {
  data: IdempotencyRecordResponse;
}

export function IdempotencyCard({ data }: IdempotencyCardProps) {
  return (
    <Card>
      <CardHeader title="Idempotency Record" />
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <InfoItem
              icon={<Hash size={14} />}
              label="Key Hash"
              value={
                <span className="font-mono text-xs break-all">
                  {data.idempotencyKeyHash}
                </span>
              }
            />
          </div>
          <InfoItem
            icon={<Tag size={14} />}
            label="Operation"
            value={data.operationName}
          />
          <InfoItem
            icon={<CheckSquare size={14} />}
            label="Status"
            value={
              <Badge variant={STATUS_VARIANT[data.status] ?? 'gray'} size="sm">
                {data.status}
              </Badge>
            }
          />
          {data.resultResourceId && (
            <InfoItem
              icon={<Tag size={14} />}
              label="Resource ID"
              value={<span className="font-mono text-xs">{data.resultResourceId}</span>}
            />
          )}
          <InfoItem
            icon={<Clock size={14} />}
            label="Created At"
            value={formatDateTime(data.createdAt)}
          />
          <InfoItem
            icon={<Clock size={14} />}
            label="Updated At"
            value={formatDateTime(data.updatedAt)}
          />
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
          {data.responseStatusCode !== undefined && (
            <InfoItem
              label="Response Status"
              value={String(data.responseStatusCode)}
            />
          )}
          {data.responseBody && (
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 mb-1">Response Body</p>
              <JsonViewer data={data.responseBody} collapsed />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
