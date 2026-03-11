// src/app/pubsub/page.tsx
'use client';

import { Activity } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { SnsEventStream } from '@/components/staff/sns-event-stream';
import { SNS_SSE_URL, SNS_STREAM_MODE, SNS_TOPIC_ARN } from '@/lib/config/env';

export default function PubSubPage() {
  return (
    <AppShell variant="staff">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="สตรีมเหตุการณ์ (Pub/Sub Events)"
          breadcrumbs={[
            { label: 'แดชบอร์ด', href: '/staff' },
            { label: 'สตรีมเหตุการณ์' }
          ]}
        />

        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm">
          <Activity size={24} className="mt-0.5 shrink-0 text-blue-600" />
          <div className="space-y-1.5 text-sm text-blue-900">
            <p className="text-base font-bold">ข้อมูลหัวข้อรับส่งข้อความ (SNS Topic)</p>
            <p className="text-blue-800">
              <span className="font-semibold">รหัสอ้างอิง (Topic ARN):</span>{' '}
              <span className="font-mono text-xs break-all bg-blue-100/50 px-2 py-0.5 rounded-md border border-blue-200">{SNS_TOPIC_ARN}</span>
            </p>
            <p className="text-blue-700 pt-1">
              แผงข้อมูลด้านล่างจะแสดงเหตุการณ์ (Events) ที่หลั่งไหลเข้ามาในระบบ Publish/Subscribe แบบเรียลไทม์
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          <SnsEventStream mode={SNS_STREAM_MODE} sseUrl={SNS_SSE_URL} />
        </div>
      </div>
    </AppShell>
  );
}