// src/components/ui/dialog.tsx
'use client';

import { X } from 'lucide-react';
import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: DialogSize;
  children?: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  className,
}: DialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
      aria-describedby={description ? 'dialog-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full bg-white rounded-3xl shadow-2xl',
          'flex flex-col max-h-[90vh] overflow-hidden',
          'transform transition-all duration-300 scale-100 opacity-100',
          sizeClasses[size],
          className,
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex-1 pr-4">
              {title && (
                <h2
                  id="dialog-title"
                  className="text-xl font-bold text-gray-900 tracking-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="dialog-description"
                  className="mt-1.5 text-sm text-gray-500 leading-relaxed"
                >
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="ปิดหน้าต่าง"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}