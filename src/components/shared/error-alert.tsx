// src/components/shared/error-alert.tsx
'use client';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  title = 'เกิดข้อผิดพลาด',
  message,
  onRetry,
  className,
}: ErrorAlertProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3.5 rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm',
        className,
      )}
      role="alert"
    >
      <div className="rounded-full bg-red-100 p-1.5 shrink-0 mt-0.5">
        <AlertCircle className="text-red-600" size={18} />
      </div>
      
      <div className="flex-1 min-w-0 space-y-1 mt-0.5">
        <p className="text-sm font-bold text-red-900">{title}</p>
        <p className="text-sm text-red-700 leading-relaxed">{message}</p>
      </div>
      
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw size={14} />}
          className="shrink-0 border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800 rounded-xl"
        >
          ลองใหม่
        </Button>
      )}
    </div>
  );
}