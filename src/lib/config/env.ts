// src\lib\config\env.ts
const DEFAULT_API_BASE_URL = '/v1/';
const DEFAULT_SNS_TOPIC_ARN =
  'arn:aws:sns:ap-southeast-1:000000000000:rescue-request-events-v1';
const DEFAULT_SNS_STREAM_MODE = 'sse';
const DEFAULT_SNS_SSE_URL = '/api/pubsub/stream';

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim();
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

export const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
);

export const SNS_TOPIC_ARN =
  process.env.NEXT_PUBLIC_SNS_TOPIC_ARN ?? DEFAULT_SNS_TOPIC_ARN;

export const SNS_STREAM_MODE =
  (process.env.NEXT_PUBLIC_SNS_STREAM_MODE ?? DEFAULT_SNS_STREAM_MODE) as
    | 'mock'
    | 'sse';

export const SNS_SSE_URL =
  process.env.NEXT_PUBLIC_SNS_SSE_URL ?? DEFAULT_SNS_SSE_URL;
