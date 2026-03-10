'use client';

import { Check } from 'lucide-react';
import React, { useId } from 'react';
import { cn } from '@/lib/utils/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  error?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  indeterminate = false,
  error,
  className,
}: CheckboxProps) {
  const id = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className="peer sr-only"
          />
          <div
            aria-hidden="true"
            onClick={() => !disabled && onChange(!checked)}
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded border-2 transition-colors cursor-pointer',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-teal-500 peer-focus-visible:ring-offset-1',
              disabled && 'opacity-50 cursor-not-allowed',
              checked || indeterminate
                ? 'bg-teal-600 border-teal-600'
                : error
                  ? 'bg-white border-red-400'
                  : 'bg-white border-gray-300 hover:border-teal-500',
            )}
          >
            {indeterminate && !checked ? (
              <span className="w-2.5 h-0.5 bg-white rounded" />
            ) : checked ? (
              <Check size={12} strokeWidth={3} className="text-white" />
            ) : null}
          </div>
        </div>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm select-none',
              disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer',
            )}
          >
            {label}
          </label>
        )}
      </div>
      {error && <p className="text-xs text-red-600 ml-7">{error}</p>}
    </div>
  );
}
