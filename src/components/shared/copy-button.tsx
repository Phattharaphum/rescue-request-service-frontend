'use client';
import { Copy, Check } from 'lucide-react';
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
      variant="ghost"
      size="sm"
      onClick={() => copy(text)}
      leftIcon={copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
      className={cn('text-gray-500 hover:text-gray-800', className)}
    >
      {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
    </Button>
  );
}
