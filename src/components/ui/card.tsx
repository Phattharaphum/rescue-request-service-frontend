// src/components/ui/card.tsx
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 pt-6 pb-4',
        className,
      )}
    >
      <h3 className="text-lg font-bold tracking-tight text-gray-900">{title}</h3>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-50 bg-gray-50/50',
        className,
      )}
    >
      {children}
    </div>
  );
}