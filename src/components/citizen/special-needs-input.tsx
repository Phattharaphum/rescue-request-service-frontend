// src/components/citizen/special-needs-input.tsx
'use client';

import { useMemo, useState } from 'react';
import { SPECIAL_NEEDS_CHIPS } from '@/lib/config/special-needs';
import { parseSpecialNeeds, serializeSpecialNeeds } from '@/lib/utils/special-needs';
import { cn } from '@/lib/utils/cn';

interface SpecialNeedsInputProps {
  value?: string;
  onChange: (value: string) => void;
}

export function SpecialNeedsInput({ value, onChange }: SpecialNeedsInputProps) {
  const parsed = useMemo(() => parseSpecialNeeds(value), [value]);
  const initialItems = parsed.mode === 'chip' ? parsed.items ?? [] : [];
  const [selectedChips, setSelectedChips] = useState<string[]>(initialItems);

  const toggleChip = (chip: string) => {
    const next = selectedChips.includes(chip)
      ? selectedChips.filter((item) => item !== chip)
      : [...selectedChips, chip];

    setSelectedChips(next);
    onChange(next.length === 0 ? '' : serializeSpecialNeeds({ mode: 'chip', items: next }));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-500">เลือกได้หลายรายการ</p>
      <div className="flex flex-wrap gap-2">
        {SPECIAL_NEEDS_CHIPS.map((chip) => {
          const selected = selectedChips.includes(chip);

          return (
            <button
              key={chip}
              type="button"
              onClick={() => toggleChip(chip)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-bold transition-colors',
                selected
                  ? 'border-cyan-500 bg-cyan-300 text-slate-950'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50',
              )}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {selectedChips.length > 0 && (
        <p className="text-xs font-semibold text-slate-500">เลือกแล้ว: {selectedChips.join(', ')}</p>
      )}
    </div>
  );
}
