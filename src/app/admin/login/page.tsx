'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { ErrorAlert } from '@/components/shared/error-alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function resolveNextPath(nextParam: string | null): string {
  if (!nextParam) return '/admin/incident';

  const normalized = nextParam.trim();
  if (!normalized.startsWith('/admin')) return '/admin/incident';
  if (normalized === '/admin/login' || normalized.startsWith('/admin/login?')) {
    return '/admin/incident';
  }

  return normalized;
}

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const nextPath = resolveNextPath(searchParams.get('next'));

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch('/api/admin/session', {
          method: 'GET',
          cache: 'no-store',
        });

        if (response.ok) {
          const payload = (await response.json()) as { authenticated?: boolean };
          if (payload.authenticated) {
            router.replace(nextPath);
            router.refresh();
            return;
          }
        }
      } catch {
        // Ignore and fall back to showing login form.
      }

      if (!cancelled) {
        setIsCheckingSession(false);
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [nextPath, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password.trim()) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setError(payload.message ?? 'ไม่สามารถเข้าสู่ระบบได้');
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError('ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md py-10" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md py-10">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">เข้าสู่ระบบผู้ดูแล</h1>
              <p className="text-sm text-gray-500">กรอกรหัสผ่านเพื่อเข้าสู่หน้าผู้ดูแลระบบ</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}

            <Input
              label="รหัสผ่านผู้ดูแล"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoFocus
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting || !password.trim()}
            >
              เข้าสู่ระบบ
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="mx-auto max-w-md py-10" />
        </AppShell>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
