'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { SnsStreamEvent, SnsStreamStats, SnsStreamStatus } from '@/types/sns';
import { createEventSourceAdapter, EventSourceAdapter } from '@/lib/api/pubsub';

interface UseSnsStreamOptions {
  maxEvents?: number;
  mode?: 'mock' | 'sse';
  sseUrl?: string;
  autoStart?: boolean;
}

interface UseSnsStreamReturn {
  events: SnsStreamEvent[];
  status: SnsStreamStatus;
  stats: SnsStreamStats;
  pause: () => void;
  resume: () => void;
  clear: () => void;
  isAutoScroll: boolean;
  setAutoScroll: (v: boolean) => void;
}

export function useSnsStream(options: UseSnsStreamOptions = {}): UseSnsStreamReturn {
  const { maxEvents = 200, mode = 'mock', sseUrl, autoStart = true } = options;
  const [events, setEvents] = useState<SnsStreamEvent[]>([]);
  const [status, setStatus] = useState<SnsStreamStatus>(
    autoStart ? 'connected' : 'paused',
  );
  const [isAutoScroll, setAutoScroll] = useState(true);
  const adapterRef = useRef<EventSourceAdapter | null>(null);

  const handleEvent = useCallback(
    (event: SnsStreamEvent) => {
      setEvents((prev) => {
        const next = [event, ...prev];
        return next.slice(0, maxEvents);
      });
    },
    [maxEvents],
  );

  const stopAdapter = useCallback(() => {
    adapterRef.current?.stop();
    adapterRef.current = null;
  }, []);

  const startAdapter = useCallback(() => {
    stopAdapter();
    const adapter = createEventSourceAdapter(mode, sseUrl);
    adapterRef.current = adapter;
    adapter.start(handleEvent, (err) => console.error('SNS stream error:', err));
  }, [mode, sseUrl, handleEvent, stopAdapter]);

  useEffect(() => {
    if (autoStart) startAdapter();
    return () => stopAdapter();
  }, [autoStart, startAdapter, stopAdapter]);

  const pause = useCallback(() => {
    stopAdapter();
    setStatus('paused');
  }, [stopAdapter]);

  const resume = useCallback(() => {
    startAdapter();
    setStatus('connected');
  }, [startAdapter]);

  const clear = useCallback(() => {
    setEvents([]);
  }, []);

  const stats: SnsStreamStats = {
    total: events.length,
    byType: events.reduce(
      (acc, e) => {
        const t = e.metadata.eventType;
        acc[t] = (acc[t] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  return { events, status, stats, pause, resume, clear, isAutoScroll, setAutoScroll };
}
