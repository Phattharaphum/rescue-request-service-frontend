// src\components\shared\pagination-controls.tsx
'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface PaginationControlsProps {
  nextCursor?: string;
  onNext: () => void;
  onPrev: () => void;
  isLoading?: boolean;
  hasPrev?: boolean;
  className?: string;
}

export function PaginationControls({
  nextCursor,
  onNext,
  onPrev,
  isLoading = false,
  hasPrev = false,
  className,
}: PaginationControlsProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={!hasPrev || isLoading}
        leftIcon={<ChevronLeft size={14} />}
      >
        ก่อนหน้า
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!nextCursor || isLoading}
        rightIcon={<ChevronRight size={14} />}
      >
        ถัดไป
      </Button>
    </div>
  );
}
