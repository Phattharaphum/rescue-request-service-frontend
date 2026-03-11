// src/components/layout/app-shell.tsx
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
      <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
        <Topbar />
        
        <div className="flex flex-1 flex-col">
          <main className="flex-1 overflow-y-auto">
            <div
              className={
                variant === 'staff'
                  // สำหรับหน้าจอเจ้าหน้าที่ (Staff Dashboard) ให้ใช้ความกว้างเต็มที่แต่จำกัดสุดที่หน้าจอใหญ่มาก
                  ? 'mx-auto w-full max-w-400 px-4 py-8 sm:px-6 lg:px-8'
                  // สำหรับหน้าจอทั่วไป (Citizen) ใช้ความกว้างที่กะทัดรัดกว่า
                  : 'mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'
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