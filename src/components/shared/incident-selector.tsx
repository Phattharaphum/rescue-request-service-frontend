// src/components/shared/incident-selector.tsx
'use client';

import { AlertTriangle } from 'lucide-react';
import type { Incident } from '@/lib/config/incidents';
import { cn } from '@/lib/utils/cn';

interface IncidentSelectorProps {
  value: string;
  onChange: (v: string) => void;
  incidents: Incident[];
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  allowAll?: boolean;
  allLabel?: string;
}

export function IncidentSelector({
  value,
  onChange,
  incidents,
  className,
  disabled,
  isLoading,
  allowAll = false,
  allLabel = 'ทุกเหตุการณ์ภัยพิบัติ',
}: IncidentSelectorProps) {
  const isDisabled = disabled || isLoading || (!allowAll && incidents.length === 0);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="flex items-center gap-1.5 text-sm font-black text-slate-700">
        <AlertTriangle size={15} className="text-amber-500" />
        เหตุการณ์ภัยพิบัติ
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={isDisabled}
          className={cn(
            'block h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-bold text-slate-950 transition-colors',
            'hover:bg-slate-50 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {allowAll && <option value="__all__">{allLabel}</option>}
          {incidents.length === 0 && !allowAll ? (
            <option value="">
              {isLoading ? 'กำลังโหลดรายการเหตุการณ์...' : 'ไม่พบรายการเหตุการณ์'}
            </option>
          ) : (
            incidents.map((incident) => (
              <option key={incident.value} value={incident.value}>
                {incident.label}
              </option>
            ))
          )}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
