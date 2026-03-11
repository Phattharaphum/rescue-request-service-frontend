// src\components\shared\empty-state.tsx
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}>
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-base font-semibold text-gray-700">{title}</p>
        {description && <p className="text-sm text-gray-500 max-w-sm">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
