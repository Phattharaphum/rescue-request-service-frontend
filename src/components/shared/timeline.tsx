import React from 'react';
import { cn } from '@/lib/utils/cn';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  color?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn('relative flex flex-col gap-0', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Line */}
            {!isLast && (
              <span
                className="absolute left-4 top-8 bottom-0 w-px bg-gray-200"
                aria-hidden="true"
              />
            )}

            {/* Dot / Icon */}
            <div
              className={cn(
                'relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0',
                item.color ?? 'bg-teal-100 text-teal-600',
              )}
            >
              {item.icon ?? (
                <span className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-sm text-gray-500">{item.description}</p>
              )}
              <time className="mt-1 block text-xs text-gray-400">{item.timestamp}</time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
