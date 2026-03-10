'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/cn';
import { parseSpecialNeeds, serializeSpecialNeeds } from '@/lib/utils/special-needs';
import { SPECIAL_NEEDS_CHIPS } from '@/lib/config/special-needs';

interface SpecialNeedsInputProps {
  value?: string;
  onChange: (value: string) => void;
}

export function SpecialNeedsInput({ value, onChange }: SpecialNeedsInputProps) {
  const parsed = parseSpecialNeeds(value);
  const [mode, setMode] = useState<'chip' | 'text'>(parsed.mode);
  const [selectedChips, setSelectedChips] = useState<string[]>(parsed.items ?? []);
  const [textValue, setTextValue] = useState<string>(parsed.text ?? '');

  const handleModeChange = (isChipMode: boolean) => {
    const newMode = isChipMode ? 'chip' : 'text';
    setMode(newMode);
    if (newMode === 'chip') {
      onChange(serializeSpecialNeeds({ mode: 'chip', items: selectedChips }));
    } else {
      onChange(serializeSpecialNeeds({ mode: 'text', text: textValue }));
    }
  };

  const toggleChip = (chip: string) => {
    const next = selectedChips.includes(chip)
      ? selectedChips.filter((c) => c !== chip)
      : [...selectedChips, chip];
    setSelectedChips(next);
    onChange(serializeSpecialNeeds({ mode: 'chip', items: next }));
  };

  const handleTextChange = (text: string) => {
    setTextValue(text);
    onChange(serializeSpecialNeeds({ mode: 'text', text }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Switch
          checked={mode === 'chip'}
          onChange={handleModeChange}
          label="เลือกจากตัวเลือก"
          size="sm"
        />
      </div>

      {mode === 'chip' ? (
        <div className="flex flex-wrap gap-2">
          {SPECIAL_NEEDS_CHIPS.map((chip) => {
            const selected = selectedChips.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                onClick={() => toggleChip(chip)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                  selected
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-teal-400 hover:text-teal-700',
                )}
              >
                {chip}
              </button>
            );
          })}
        </div>
      ) : (
        <Textarea
          placeholder="ระบุความต้องการพิเศษ เช่น ผู้สูงอายุ ผู้ป่วยติดเตียง ต้องใช้รถเข็น..."
          value={textValue}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={3}
        />
      )}

      {mode === 'chip' && selectedChips.length > 0 && (
        <p className="text-xs text-gray-500">
          เลือกแล้ว: {selectedChips.join(', ')}
        </p>
      )}
    </div>
  );
}
