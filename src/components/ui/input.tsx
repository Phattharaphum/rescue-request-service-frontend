// src/components/ui/input.tsx
'use client';

import React, { useId } from 'react';
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
    // ใช้ useId เพื่อป้องกันปัญหาภาษาไทยไปแปลงเป็น id แล้วพัง
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
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
              'block w-full rounded-xl border bg-white px-4 py-2.5 text-base text-gray-900 shadow-sm',
              'placeholder:text-gray-400 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              leftIcon ? 'pl-11' : '',
              error
                ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500'
                : 'border-gray-200 hover:border-gray-300',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm font-medium text-red-500">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';