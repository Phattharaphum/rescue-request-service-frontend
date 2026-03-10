interface ParsedSpecialNeeds {
  mode: 'chip' | 'text';
  items?: string[];
  text?: string;
}

export function parseSpecialNeeds(value: string | undefined | null): ParsedSpecialNeeds {
  if (!value) return { mode: 'text', text: '' };

  try {
    const parsed = JSON.parse(value) as ParsedSpecialNeeds;
    if (parsed.mode && parsed.items) {
      return { mode: 'chip', items: parsed.items };
    }
  } catch {
    // Not JSON — continue to prefix checks
  }

  if (value.startsWith('chip:')) {
    const items = value.slice(5).split('|').filter(Boolean);
    return { mode: 'chip', items };
  }

  if (value.startsWith('text:')) {
    return { mode: 'text', text: value.slice(5) };
  }

  return { mode: 'text', text: value };
}

export function serializeSpecialNeeds(parsed: ParsedSpecialNeeds): string {
  if (parsed.mode === 'chip' && parsed.items?.length) {
    return `chip:${parsed.items.join('|')}`;
  }
  return `text:${parsed.text ?? ''}`;
}

export function isChipSpecialNeeds(value: string | undefined | null): boolean {
  if (!value) return false;
  if (value.startsWith('chip:')) return true;
  try {
    const parsed = JSON.parse(value) as ParsedSpecialNeeds;
    return parsed.mode === 'chip';
  } catch {
    return false;
  }
}
