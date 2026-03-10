import { SnsEnvelope, SnsStreamEvent, PublishedEventType } from '@/types/sns';
import { v4 as uuidv4 } from 'uuid';

export interface EventSourceAdapter {
  start(onEvent: (event: SnsStreamEvent) => void, onError?: (err: Error) => void): void;
  stop(): void;
}

const MOCK_REQUEST_IDS = ['REQ-001', 'REQ-002', 'REQ-003'];
const MOCK_EVENT_TYPES: PublishedEventType[] = [
  'rescue-request.created',
  'rescue-request.status-changed',
  'rescue-request.citizen-updated',
  'rescue-request.resolved',
  'rescue-request.cancelled',
];

function createMockEvent(): SnsStreamEvent {
  const eventType = MOCK_EVENT_TYPES[Math.floor(Math.random() * MOCK_EVENT_TYPES.length)];
  const requestId = MOCK_REQUEST_IDS[Math.floor(Math.random() * MOCK_REQUEST_IDS.length)];

  const envelope: SnsEnvelope = {
    metadata: {
      eventType,
      eventId: uuidv4(),
      timestamp: new Date().toISOString(),
      partitionKey: requestId,
      schemaVersion: '1.0',
      source: 'rescue-request-service',
      correlationId: uuidv4(),
    },
    body: {
      requestId,
      incidentId: 'INC-2026-001',
      ...(eventType === 'rescue-request.status-changed'
        ? { newStatus: 'TRIAGED', previousStatus: 'SUBMITTED' }
        : {}),
    },
  };

  return {
    ...envelope,
    _receivedAt: new Date().toISOString(),
    _id: uuidv4(),
  };
}

export class MockEventSourceAdapter implements EventSourceAdapter {
  private intervalId?: ReturnType<typeof setTimeout>;

  start(onEvent: (event: SnsStreamEvent) => void): void {
    setTimeout(() => onEvent(createMockEvent()), 500);
    setTimeout(() => onEvent(createMockEvent()), 1200);

    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 5000;
      this.intervalId = setTimeout(() => {
        onEvent(createMockEvent());
        scheduleNext();
      }, delay);
    };
    scheduleNext();
  }

  stop(): void {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = undefined;
    }
  }
}

export class SSEEventSourceAdapter implements EventSourceAdapter {
  private eventSource?: EventSource;

  constructor(private readonly url: string) {}

  start(
    onEvent: (event: SnsStreamEvent) => void,
    onError?: (err: Error) => void,
  ): void {
    this.eventSource = new EventSource(this.url);
    this.eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data as string) as SnsEnvelope;
        onEvent({ ...data, _receivedAt: new Date().toISOString(), _id: uuidv4() });
      } catch {
        // Ignore malformed messages
      }
    };
    this.eventSource.onerror = () =>
      onError?.(new Error('SSE connection error'));
  }

  stop(): void {
    this.eventSource?.close();
  }
}

export function createEventSourceAdapter(
  mode: 'mock' | 'sse' = 'mock',
  url?: string,
): EventSourceAdapter {
  if (mode === 'sse' && url) return new SSEEventSourceAdapter(url);
  return new MockEventSourceAdapter();
}
