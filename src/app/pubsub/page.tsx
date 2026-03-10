'use client';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { SnsEventStream } from '@/components/staff/sns-event-stream';
import { Info } from 'lucide-react';

export default function PubSubPage() {
  return (
    <AppShell variant="default">
      <div className="space-y-6">
        <PageHeader
          title="กระแสข้อมูล Pub/Sub"
          breadcrumbs={[{ label: 'หน้าหลัก', href: '/' }, { label: 'Pub/Sub Events' }]}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">กระแสข้อมูล SNS/SQS</p>
            <p>ติดตาม Topic: <span className="font-mono">rescue-request-events-v1-{'{stage}'}</span></p>
            <p className="text-blue-600 mt-1">ข้อมูลนี้แสดงเหตุการณ์แบบ real-time จากระบบ</p>
          </div>
        </div>

        <SnsEventStream />
      </div>
    </AppShell>
  );
}
