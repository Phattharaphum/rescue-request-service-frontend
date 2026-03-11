// src/components/ui/toast.tsx
'use client';

import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast ต้องถูกเรียกใช้ภายใน <ToastProvider> เท่านั้น');
  return ctx;
}

const toastConfig: Record<
  ToastType,
  { icon: React.ReactNode; containerClass: string; iconClass: string; title: string }
> = {
  success: {
    icon: <CheckCircle2 size={20} />,
    containerClass: 'bg-white border-green-500',
    iconClass: 'text-green-500',
    title: 'สำเร็จ',
  },
  error: {
    icon: <XCircle size={20} />,
    containerClass: 'bg-white border-red-500',
    iconClass: 'text-red-500',
    title: 'เกิดข้อผิดพลาด',
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    containerClass: 'bg-white border-amber-500',
    iconClass: 'text-amber-500',
    title: 'ข้อควรระวัง',
  },
  info: {
    icon: <Info size={20} />,
    containerClass: 'bg-white border-blue-500',
    iconClass: 'text-blue-500',
    title: 'ข้อมูล',
  },
};

const AUTO_DISMISS_MS = 5000;

function ToastItemComponent({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const config = toastConfig[toast.type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, AUTO_DISMISS_MS);

    return () => {
      cancelAnimationFrame(frame);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 w-full max-w-sm px-4 py-4 rounded-2xl shadow-xl border-l-4',
        'transition-all duration-300 transform',
        config.containerClass,
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95',
      )}
    >
      <span className={cn('shrink-0 mt-0.5', config.iconClass)}>{config.icon}</span>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-bold text-gray-900">{config.title}</p>
        <p className="text-sm text-gray-600 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        aria-label="ปิดการแจ้งเตือน"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-label="การแจ้งเตือนของระบบ"
        className="fixed bottom-4 right-4 z-100 flex flex-col gap-3 items-end pointer-events-none sm:bottom-6 sm:right-6"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full max-w-sm">
            <ToastItemComponent toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}