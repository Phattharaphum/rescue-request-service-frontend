'use client';

import { Info } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { SnsEventStream } from '@/components/staff/sns-event-stream';
import { SNS_SSE_URL, SNS_STREAM_MODE, SNS_TOPIC_ARN } from '@/lib/config/env';

export default function PubSubPage() {
  return (
    <AppShell variant="default">
      <div className="space-y-6">
        <PageHeader
          title="Pub/Sub Events"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Pub/Sub Events' }]}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">SNS Topic</p>
            <p>
              Topic ARN:{' '}
              <span className="font-mono break-all">{SNS_TOPIC_ARN}</span>
            </p>
            <p className="text-blue-600 mt-1">
              Event stream panel below shows incoming publish/subscribe messages.
            </p>
          </div>
        </div>

        <SnsEventStream mode={SNS_STREAM_MODE} sseUrl={SNS_SSE_URL} />
      </div>
    </AppShell>
  );
}
