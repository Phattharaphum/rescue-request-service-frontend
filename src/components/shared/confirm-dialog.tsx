'use client';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  const Icon = variant === 'danger' ? AlertCircle : AlertTriangle;
  const iconClass = variant === 'danger' ? 'text-red-500' : 'text-amber-500';
  const confirmVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${variant === 'danger' ? 'bg-red-50' : 'bg-amber-50'}`}>
          <Icon className={iconClass} size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        <div className="flex w-full gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            className="flex-1"
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
