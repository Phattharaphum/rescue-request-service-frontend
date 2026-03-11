import React from 'react';
import { Topbar } from '@/components/layout/topbar';
import { ToastProvider } from '@/components/ui/toast';

type AppShellVariant = 'citizen' | 'staff' | 'default';

interface AppShellProps {
  children: React.ReactNode;
  variant?: AppShellVariant;
}

export function AppShell({ children, variant = 'default' }: AppShellProps) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Topbar />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 overflow-y-auto">
            <div
              className={
                variant === 'staff'
                  ? 'mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6'
                  : 'mx-auto max-w-7xl px-4 py-6 sm:px-6'
              }
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
