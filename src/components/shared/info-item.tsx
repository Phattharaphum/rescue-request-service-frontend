import React from 'react';
import { cn } from '@/lib/utils/cn';

interface InfoItemProps {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function InfoItem({ label, value, icon, className }: InfoItemProps) {
  return (
    <div className={cn('flex items-start gap-2', className)}>
      {icon && <span className="shrink-0 mt-0.5 text-gray-400">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-gray-900 break-words">
          {value ?? <span className="text-gray-400 font-normal">—</span>}
        </div>
      </div>
    </div>
  );
}
