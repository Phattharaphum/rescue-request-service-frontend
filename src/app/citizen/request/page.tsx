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
      <div className="space-y-6">
        <PageHeader
          title="แจ้งคำขอช่วยเหลือ"
          breadcrumbs={[{ label: 'หน้าหลัก', href: '/' }, { label: 'แจ้งคำขอช่วยเหลือ' }]}
        />
        <RescueRequestForm onSuccess={handleSuccess} />
      </div>
    </AppShell>
  );
}
