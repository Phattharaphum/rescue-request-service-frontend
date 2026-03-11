// src/components/shared/copy-button.tsx
'use client';
import { Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopy } from '@/lib/hooks/use-copy';
import { cn } from '@/lib/utils/cn';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const { copy, copied } = useCopy();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => copy(text)}
      leftIcon={
        copied ? (
          <CheckCircle2 size={16} className="text-green-600" />
        ) : (
          <Copy size={16} className="text-blue-600" />
        )
      }
      className={cn(
        'rounded-lg font-medium transition-all duration-200',
        copied 
          ? 'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800' 
          : 'bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:text-blue-800',
        className
      )}
      aria-label="คัดลอกรหัส"
    >
      {copied ? 'คัดลอกสำเร็จ' : 'คัดลอกรหัส'}
    </Button>
  );
}