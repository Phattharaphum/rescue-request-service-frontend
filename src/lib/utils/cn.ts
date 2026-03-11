// src\lib\utils\cn.ts
export function cn(
  ...inputs: (string | undefined | null | false | Record<string, boolean>)[]
): string {
  return inputs
    .flatMap((input) => {
      if (!input) return [];
      if (typeof input === 'string') return [input];
      return Object.entries(input)
        .filter(([, v]) => v)
        .map(([k]) => k);
    })
    .join(' ');
}
