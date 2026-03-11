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
        'flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4',
        className,
      )}
      role="alert"
    >
      <AlertCircle className="shrink-0 mt-0.5 text-red-500" size={18} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-800">{title}</p>
        <p className="mt-0.5 text-sm text-red-700">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw size={14} />}
          className="shrink-0 border-red-300 text-red-700 hover:bg-red-100"
        >
          ลองใหม่
        </Button>
      )}
    </div>
  );
}
