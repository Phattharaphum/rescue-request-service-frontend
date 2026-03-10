export interface SnsEventMetadata {
  eventType: string;
  eventId: string;
  timestamp: string;
  partitionKey: string;
  schemaVersion: string;
  source: string;
  correlationId?: string;
}

export interface SnsEnvelope<T = Record<string, unknown>> {
  metadata: SnsEventMetadata;
  body: T;
}

export type PublishedEventType =
  | 'rescue-request.created'
  | 'rescue-request.status-changed'
  | 'rescue-request.citizen-updated'
  | 'rescue-request.resolved'
  | 'rescue-request.cancelled';

export interface SnsStreamEvent extends SnsEnvelope {
  _receivedAt: string;
  _id: string;
}

export interface SnsStreamStats {
  total: number;
  byType: Record<string, number>;
}

export type SnsStreamStatus = 'connected' | 'paused' | 'disconnected';
