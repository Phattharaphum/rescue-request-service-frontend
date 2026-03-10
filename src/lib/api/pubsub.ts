import { v4 as uuidv4 } from 'uuid';
import { PublishedEventType, SnsEnvelope, SnsEventMetadata, SnsStreamEvent } from '@/types/sns';

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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseJsonIfString(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const text = value.trim();
  if (!text) return value;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return value;
  }
}

function toStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function inferEventTypeFromBody(body: unknown): string {
  const payload = asRecord(body);
  if (!payload) return 'raw-message';

  if (toStringValue(payload.eventType)) {
    return toStringValue(payload.eventType) ?? 'raw-message';
  }

  const newStatus = toStringValue(payload.newStatus);
  if (newStatus === 'RESOLVED') return 'rescue-request.resolved';
  if (newStatus === 'CANCELLED') return 'rescue-request.cancelled';
  if (newStatus || payload.previousStatus !== undefined || payload.eventId !== undefined) {
    return 'rescue-request.status-changed';
  }

  if (toStringValue(payload.updateType) || payload.updateId !== undefined) {
    return 'rescue-request.citizen-updated';
  }

  const data = asRecord(payload.data);
  if (
    (data && (toStringValue(data.itemType) === 'MASTER' || data.requestType !== undefined)) ||
    (payload.requestId !== undefined && payload.requestType !== undefined && payload.incidentId !== undefined)
  ) {
    return 'rescue-request.created';
  }

  return 'raw-message';
}

function unwrapCandidate(value: unknown, depth = 0): unknown {
  const parsed = parseJsonIfString(value);
  if (depth >= 5) return parsed;

  const record = asRecord(parsed);
  if (!record) return parsed;

  if (asRecord(record.header) && record.body !== undefined) {
    return record;
  }

  const candidates = [record.Message, record.message, record.payload, record.data, record.body];
  for (const candidate of candidates) {
    if (candidate === undefined) continue;

    const unwrapped = unwrapCandidate(candidate, depth + 1);
    const unwrappedRecord = asRecord(unwrapped);
    if (unwrappedRecord && asRecord(unwrappedRecord.header) && unwrappedRecord.body !== undefined) {
      return unwrappedRecord;
    }
  }

  return record;
}

function buildMetadata(
  fallback: Partial<SnsEventMetadata>,
  header?: Record<string, unknown> | null,
  resolvedBody?: unknown,
): SnsEventMetadata {
  const headerEventType = header ? toStringValue(header.eventType) : undefined;
  const resolvedType =
    (toStringValue(fallback.eventType) && fallback.eventType !== 'raw-message'
      ? fallback.eventType
      : undefined) ??
    headerEventType ??
    inferEventTypeFromBody(resolvedBody);

  const requestIdFromBody = asRecord(resolvedBody)?.requestId;

  return {
    eventType: resolvedType,
    eventId:
      toStringValue(fallback.eventId) ??
      (header ? toStringValue(header.messageId) : undefined) ??
      uuidv4(),
    timestamp:
      toStringValue(fallback.timestamp) ??
      (header ? toStringValue(header.occurredAt) : undefined) ??
      new Date().toISOString(),
    partitionKey:
      toStringValue(fallback.partitionKey) ??
      (header ? toStringValue(header.partitionKey) : undefined) ??
      toStringValue(requestIdFromBody) ??
      '-',
    schemaVersion:
      toStringValue(fallback.schemaVersion) ??
      (header ? toStringValue(header.schemaVersion) : undefined) ??
      '1.0',
    source:
      toStringValue(fallback.source) ??
      (header ? toStringValue(header.producer) : undefined) ??
      'rescue-request-service',
    correlationId:
      toStringValue(fallback.correlationId) ??
      (header ? toStringValue(header.correlationId) : undefined),
  };
}

function normalizeIncomingEnvelope(raw: unknown): SnsEnvelope {
  const unwrapped = unwrapCandidate(raw);
  const record = asRecord(unwrapped);

  if (!record) {
    return {
      metadata: buildMetadata({ eventType: 'raw-message' }, null, raw),
      body: raw,
    };
  }

  const metadata = asRecord(record.metadata);

  if (metadata && record.body !== undefined) {
    const parsedBody = parseJsonIfString(record.body);
    const nestedEvent = asRecord(unwrapCandidate(parsedBody));
    const nestedHeader = nestedEvent ? asRecord(nestedEvent.header) : null;
    const nestedBody = nestedEvent && nestedEvent.body !== undefined
      ? parseJsonIfString(nestedEvent.body)
      : parsedBody;

    return {
      metadata: buildMetadata(
        {
          eventType: toStringValue(metadata.eventType),
          eventId: toStringValue(metadata.eventId),
          timestamp: toStringValue(metadata.timestamp),
          partitionKey: toStringValue(metadata.partitionKey),
          schemaVersion: toStringValue(metadata.schemaVersion),
          source: toStringValue(metadata.source),
          correlationId: toStringValue(metadata.correlationId),
        },
        nestedHeader,
        nestedBody,
      ),
      body: nestedBody,
    };
  }

  const header = asRecord(record.header);
  if (header && record.body !== undefined) {
    const body = parseJsonIfString(record.body);
    return {
      metadata: buildMetadata({}, header, body),
      body,
    };
  }

  const fallbackBody = parseJsonIfString(record.body ?? record);
  return {
    metadata: buildMetadata({}, null, fallbackBody),
    body: fallbackBody,
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
        const data = JSON.parse(e.data as string) as unknown;
        const normalized = normalizeIncomingEnvelope(data);
        onEvent({ ...normalized, _receivedAt: new Date().toISOString(), _id: uuidv4() });
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
