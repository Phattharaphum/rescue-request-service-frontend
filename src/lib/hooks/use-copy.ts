// src\lib\hooks\use-copy.ts
'use client';
import { useState, useCallback } from 'react';

export function useCopy(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
      } catch {
        // Clipboard API not available
      }
    },
    [timeout],
  );

  return { copy, copied };
}
