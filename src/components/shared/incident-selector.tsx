// src/components/shared/incident-selector.tsx
'use client';
import { cn } from '@/lib/utils/cn';
import { INCIDENTS } from '@/lib/config/incidents';
import { AlertTriangle } from 'lucide-react';

interface IncidentSelectorProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export function IncidentSelector({ value, onChange, className }: IncidentSelectorProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        <AlertTriangle size={14} className="text-amber-500" />
        เหตุการณ์ภัยพิบัติ
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 shadow-sm transition-colors',
            'hover:border-gray-300',
            'focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {INCIDENTS.map((incident) => (
            <option key={incident.value} value={incident.value}>
              {incident.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}