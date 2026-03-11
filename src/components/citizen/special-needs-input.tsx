// src\components\citizen\special-needs-input.tsx
'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { parseSpecialNeeds, serializeSpecialNeeds } from '@/lib/utils/special-needs';
import { SPECIAL_NEEDS_CHIPS } from '@/lib/config/special-needs';

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
      ? selectedChips.filter((c) => c !== chip)
      : [...selectedChips, chip];

    setSelectedChips(next);

    if (next.length === 0) {
      onChange('');
      return;
    }

    onChange(serializeSpecialNeeds({ mode: 'chip', items: next }));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">เลือกได้หลายรายการ</p>
      <div className="flex flex-wrap gap-2">
        {SPECIAL_NEEDS_CHIPS.map((chip) => {
          const selected = selectedChips.includes(chip);
          return (
            <button
              key={chip}
              type="button"
              onClick={() => toggleChip(chip)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                selected
                  ? 'border-teal-600 bg-teal-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-teal-400 hover:text-teal-700',
              )}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {selectedChips.length > 0 && (
        <p className="text-xs text-gray-500">เลือกแล้ว: {selectedChips.join(', ')}</p>
      )}
    </div>
  );
}
