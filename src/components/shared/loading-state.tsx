'use client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'กำลังโหลด...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16', className)}>
      <Loader2 className="animate-spin text-teal-600" size={36} />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
