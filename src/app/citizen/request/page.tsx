// src/app/citizen/request/page.tsx
'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { RescueRequestForm } from '@/components/citizen/rescue-request-form';
import { isSupportedRequestType } from '@/lib/config/request-types';

function CitizenRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestTypeParam = searchParams.get('requestType');
  const initialRequestType = isSupportedRequestType(requestTypeParam)
    ? requestTypeParam
    : undefined;

  function handleSuccess(data: {
    requestId: string;
    trackingCode: string;
    status: string;
    submittedAt: string;
  }) {
    const params = new URLSearchParams({
      requestId: data.requestId,
      trackingCode: data.trackingCode,
      status: data.status,
      submittedAt: data.submittedAt,
    });
    router.push(`/citizen/success?${params.toString()}`);
  }

  return (
    <AppShell variant="citizen">
      <div className="mx-auto max-w-3xl space-y-8 py-6">
        <PageHeader
          title="แจ้งขอความช่วยเหลือฉุกเฉิน"
          breadcrumbs={[
            { label: 'หน้าหลัก', href: '/' },
            { label: 'แจ้งขอความช่วยเหลือ' }
          ]}
        />
        
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 sm:p-8">
          <RescueRequestForm initialRequestType={initialRequestType} onSuccess={handleSuccess} />
        </div>
      </div>
    </AppShell>
  );
}

export default function CitizenRequestPage() {
  return (
    <Suspense
      fallback={
        <AppShell variant="citizen">
          <div className="mx-auto max-w-3xl py-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold text-gray-600">กำลังโหลดแบบฟอร์ม...</p>
            </div>
          </div>
        </AppShell>
      }
    >
      <CitizenRequestContent />
    </Suspense>
  );
}
