export function maskPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '*'.repeat(digits.length);
  const visible = digits.slice(-4);
  const masked = '*'.repeat(digits.length - 4);
  return masked + visible;
}

export function maskName(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const word = parts[0];
    if (word.length <= 1) return word;
    return word[0] + '*'.repeat(word.length - 1);
  }
  return parts
    .map((part, i) => {
      if (i === 0) return part;
      if (part.length <= 1) return part;
      return part[0] + '*'.repeat(part.length - 1);
    })
    .join(' ');
}
