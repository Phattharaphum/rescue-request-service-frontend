import React from 'react';
import { Topbar } from '@/components/layout/topbar';
import { Sidebar } from '@/components/layout/sidebar';
import { ToastProvider } from '@/components/ui/toast';

type AppShellVariant = 'citizen' | 'staff' | 'default';

interface AppShellProps {
  children: React.ReactNode;
  variant?: AppShellVariant;
}

export function AppShell({ children, variant = 'default' }: AppShellProps) {
  const isStaff = variant === 'staff';

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Topbar />
        <div className={isStaff ? 'flex flex-1 overflow-hidden' : 'flex flex-1 flex-col'}>
          {isStaff && <Sidebar />}
          <main className="flex-1 overflow-y-auto">
            <div className={isStaff ? 'p-6' : 'mx-auto max-w-7xl px-4 py-6 sm:px-6'}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
