// src\app\staff\requests\[requestId]\idempotency\page.tsx
'use client';
import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { IdempotencyCard } from '@/components/staff/idempotency-card';
import { JsonViewer } from '@/components/shared/json-viewer';
import { ErrorAlert } from '@/components/shared/error-alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getIdempotencyRecord } from '@/lib/api/rescue';
import type { IdempotencyRecordResponse } from '@/types/rescue';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default function IdempotencyPage({ params }: PageProps) {
  const { requestId } = React.use(params);
  const [keyHash, setKeyHash] = useState('');
  const [data, setData] = useState<IdempotencyRecordResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyHash.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await getIdempotencyRecord(keyHash.trim());
      setData(result);
    } catch {
      setError('ไม่พบข้อมูล Idempotency หรือเกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell variant="staff">
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          title="ข้อมูล Idempotency"
          breadcrumbs={[
            { label: 'แผงควบคุม', href: '/admin/incident' },
            { label: 'คำขอ', href: `/admin/incident/requests/${requestId}` },
            { label: 'Idempotency' },
          ]}
        />

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idempotency Key Hash
              </label>
              <Input
                value={keyHash}
                onChange={(e) => setKeyHash(e.target.value)}
                placeholder="ระบุ key hash..."
                className="font-mono"
              />
            </div>
            <Button type="submit" variant="primary" disabled={loading || !keyHash.trim()}>
              {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
            </Button>
          </form>
        </div>

        {error && <ErrorAlert message={error} />}
        {data && (
          <div className="space-y-4">
            <IdempotencyCard data={data} />
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">ข้อมูล JSON</h3>
              <JsonViewer data={data} />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
