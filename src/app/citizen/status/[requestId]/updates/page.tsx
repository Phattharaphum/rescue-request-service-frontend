'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Info } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { CitizenUpdateForm } from '@/components/citizen/citizen-update-form';
import { CitizenUpdatesList } from '@/components/citizen/citizen-updates-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

function UpdatesContent({ requestId }: { requestId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackingCodeFromQuery = searchParams.get('trackingCode') ?? '';
  const [manualTrackingCode, setManualTrackingCode] = useState('');
  const [listVersion, setListVersion] = useState(0);

  const effectiveTrackingCode = trackingCodeFromQuery || manualTrackingCode.trim();

  const applyTrackingCode = () => {
    const nextCode = manualTrackingCode.trim();
    if (!nextCode) return;

    const next = new URLSearchParams(searchParams.toString());
    next.set('trackingCode', nextCode);
    router.replace(`/citizen/status/${requestId}/updates?${next.toString()}`);
  };

  return (
    <div className="space-y-6">
      {!trackingCodeFromQuery && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 w-full space-y-3">
            <p className="font-medium">Tracking code is required to submit updates</p>
            <p>Enter your tracking code to continue, or go back to lookup.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Tracking code"
                value={manualTrackingCode}
                onChange={(e) => setManualTrackingCode(e.target.value)}
              />
              <Button
                type="button"
                variant="primary"
                onClick={applyTrackingCode}
                disabled={!manualTrackingCode.trim()}
              >
                Continue
              </Button>
            </div>
            <Link href="/citizen/track" className="inline-block">
              <Button type="button" variant="outline">Back to lookup</Button>
            </Link>
          </div>
        </div>
      )}

      {effectiveTrackingCode ? (
        <CitizenUpdateForm
          requestId={requestId}
          trackingCode={effectiveTrackingCode}
          onSuccess={() => setListVersion((v) => v + 1)}
        />
      ) : null}

      <CitizenUpdatesList key={`${requestId}-${listVersion}`} requestId={requestId} />
    </div>
  );
}

export default function CitizenUpdatesPage({ params }: PageProps) {
  const { requestId } = React.use(params);
  const searchParams = useSearchParams();
  const trackingCode = searchParams.get('trackingCode') ?? '';
  const statusHref = trackingCode
    ? `/citizen/status/${requestId}?trackingCode=${encodeURIComponent(trackingCode)}`
    : `/citizen/status/${requestId}`;

  return (
    <AppShell variant="citizen">
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          title="Send Additional Information"
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Status', href: statusHref },
            { label: 'Updates' },
          ]}
        />
        <Suspense fallback={<div>Loading...</div>}>
          <UpdatesContent requestId={requestId} />
        </Suspense>
      </div>
    </AppShell>
  );
}
