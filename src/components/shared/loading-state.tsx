// src/components/shared/loading-state.tsx
'use client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'กำลังประมวลผล...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16', className)}>
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}