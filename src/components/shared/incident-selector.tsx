'use client';
import { cn } from '@/lib/utils/cn';
import { INCIDENTS } from '@/lib/config/incidents';

interface IncidentSelectorProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export function IncidentSelector({ value, onChange, className }: IncidentSelectorProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-sm font-medium text-gray-700">เลือกเหตุการณ์</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {INCIDENTS.map((incident) => (
          <option key={incident.value} value={incident.value}>
            {incident.label}
          </option>
        ))}
      </select>
    </div>
  );
}
