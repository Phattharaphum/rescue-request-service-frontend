'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, required, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={cn(
              'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900',
              'placeholder:text-gray-400 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              leftIcon ? 'pl-10' : '',
              error
                ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                : 'border-gray-300 hover:border-gray-400',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1 text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
