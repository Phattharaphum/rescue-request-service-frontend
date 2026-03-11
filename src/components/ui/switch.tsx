'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className,
}: SwitchProps) {
  const id = useId();

  const trackSize = size === 'sm' ? 'w-8 h-4' : 'w-11 h-6';
  const thumbSize = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
  const thumbTranslate = size === 'sm'
    ? checked ? 'translate-x-4' : 'translate-x-0.5'
    : checked ? 'translate-x-5' : 'translate-x-0.5';

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          trackSize,
          checked ? 'bg-teal-600' : 'bg-gray-200',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-sm',
            'transform transition-transform duration-200 ease-in-out',
            thumbSize,
            thumbTranslate,
          )}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'text-sm font-medium select-none',
            disabled ? 'text-gray-400' : 'text-gray-700 cursor-pointer',
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}
