// src/components/ui/badge.tsx
import React from 'react';
import { cn } from '@/lib/utils/cn';

type BadgeVariant =
  | 'default'
  | 'gray'
  | 'amber'
  | 'blue'
  | 'purple'
  | 'green'
  | 'red'
  | 'teal'
  | 'orange';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 border border-gray-200',
  gray: 'bg-gray-100 text-gray-800 border border-gray-200',
  amber: 'bg-amber-50 text-amber-800 border border-amber-200',
  blue: 'bg-blue-50 text-blue-800 border border-blue-200',
  purple: 'bg-purple-50 text-purple-800 border border-purple-200',
  green: 'bg-green-50 text-green-800 border border-green-200',
  red: 'bg-red-50 text-red-800 border border-red-200',
  teal: 'bg-teal-50 text-teal-800 border border-teal-200',
  orange: 'bg-orange-50 text-orange-800 border border-orange-200',
};

const dotColorClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  gray: 'bg-gray-400',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  teal: 'bg-teal-500',
  orange: 'bg-orange-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-bold rounded-full shadow-sm',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('shrink-0 rounded-full', dotColorClasses[variant], {
            'w-1.5 h-1.5': size === 'sm',
            'w-2 h-2': size === 'md',
          })}
        />
      )}
      {children}
    </span>
  );
}