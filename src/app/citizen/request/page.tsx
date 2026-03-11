// src/app/citizen/request/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { RescueRequestForm } from '@/components/citizen/rescue-request-form';

export default function CitizenRequestPage() {
  const router = useRouter();

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
          <RescueRequestForm onSuccess={handleSuccess} />
        </div>
      </div>
    </AppShell>
  );
}