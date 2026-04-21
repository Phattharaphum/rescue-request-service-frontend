interface ParsedSpecialNeeds {
  mode: 'chip' | 'text';
  items?: string[];
  text?: string;
}

function toCleanList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (typeof item === 'number' || typeof item === 'boolean') return String(item);
      return '';
    })
    .filter(Boolean);
}

function parseObjectSpecialNeeds(value: Record<string, unknown>): ParsedSpecialNeeds | null {
  if (value.mode === 'chip') {
    const items = toCleanList(value.items);
    if (items.length > 0) return { mode: 'chip', items };
    return { mode: 'text', text: '' };
  }

  if (value.mode === 'text') {
    const text = typeof value.text === 'string' ? value.text : '';
    return { mode: 'text', text };
  }

  const items = toCleanList(value.items);
  if (items.length > 0) return { mode: 'chip', items };

  if (typeof value.text === 'string') {
    return { mode: 'text', text: value.text };
  }

  return null;
}

export function parseSpecialNeeds(value: unknown): ParsedSpecialNeeds {
  if (value === null || value === undefined || value === '') {
    return { mode: 'text', text: '' };
  }

  if (Array.isArray(value)) {
    const items = toCleanList(value);
    return items.length > 0 ? { mode: 'chip', items } : { mode: 'text', text: '' };
  }

  if (typeof value === 'object') {
    const parsedObject = parseObjectSpecialNeeds(value as Record<string, unknown>);
    return parsedObject ?? { mode: 'text', text: '' };
  }

  if (typeof value !== 'string') {
    return { mode: 'text', text: String(value) };
  }

  const textValue = value.trim();
  if (!textValue) return { mode: 'text', text: '' };

  try {
    const parsed = JSON.parse(textValue) as unknown;

    if (Array.isArray(parsed)) {
      const items = toCleanList(parsed);
      if (items.length > 0) return { mode: 'chip', items };
    } else if (parsed && typeof parsed === 'object') {
      const parsedObject = parseObjectSpecialNeeds(parsed as Record<string, unknown>);
      if (parsedObject) return parsedObject;
    }
  } catch {
    // Not JSON, continue with prefix checks.
  }

  if (textValue.startsWith('chip:')) {
    const items = textValue
      .slice(5)
      .split('|')
      .map((item) => item.trim())
      .filter(Boolean);
    return { mode: 'chip', items };
  }

  if (textValue.startsWith('text:')) {
    return { mode: 'text', text: textValue.slice(5) };
  }

  return { mode: 'text', text: textValue };
}

export function serializeSpecialNeeds(parsed: ParsedSpecialNeeds): string {
  if (parsed.mode === 'chip' && parsed.items?.length) {
    return `chip:${parsed.items.join('|')}`;
  }

  return `text:${parsed.text ?? ''}`;
}

export function isChipSpecialNeeds(value: unknown): boolean {
  const parsed = parseSpecialNeeds(value);
  return parsed.mode === 'chip' && (parsed.items?.length ?? 0) > 0;
}
