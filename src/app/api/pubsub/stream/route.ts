import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
  type Message,
} from '@aws-sdk/client-sqs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SnsEnvelope {
  metadata: {
    eventType: string;
    eventId: string;
    timestamp: string;
    partitionKey: string;
    schemaVersion: string;
    source: string;
    correlationId?: string;
  };
  body: Record<string, unknown>;
}

const encoder = new TextEncoder();

const AWS_ENDPOINT_URL = process.env.AWS_ENDPOINT_URL;
const AWS_REGION = process.env.AWS_REGION ?? 'ap-southeast-1';
const SQS_QUEUE_URL = process.env.SNS_STREAM_SQS_QUEUE_URL;
const POLL_WAIT_SECONDS = Number(process.env.SNS_STREAM_WAIT_SECONDS ?? '20');
const IDLE_DELAY_MS = Number(process.env.SNS_STREAM_IDLE_DELAY_MS ?? '1000');

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSnsEnvelope(value: unknown): value is SnsEnvelope {
  if (!isObject(value)) return false;
  if (!isObject(value.metadata) || !isObject(value.body)) return false;
  const metadata = value.metadata as Record<string, unknown>;
  return (
    typeof metadata.eventType === 'string' &&
    typeof metadata.eventId === 'string' &&
    typeof metadata.timestamp === 'string' &&
    typeof metadata.partitionKey === 'string' &&
    typeof metadata.schemaVersion === 'string' &&
    typeof metadata.source === 'string'
  );
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseEnvelopeFromSqsBody(body: string): SnsEnvelope | null {
  const parsed = tryParseJson(body);
  if (!parsed) {
    return {
      metadata: {
        eventType: 'raw-message',
        eventId: `raw-${Date.now()}`,
        timestamp: new Date().toISOString(),
        partitionKey: 'unknown',
        schemaVersion: '1.0',
        source: 'sqs-raw',
      },
      body: { raw: body },
    };
  }

  if (!isObject(parsed)) {
    return {
      metadata: {
        eventType: 'raw-message',
        eventId: `raw-${Date.now()}`,
        timestamp: new Date().toISOString(),
        partitionKey: 'unknown',
        schemaVersion: '1.0',
        source: 'sqs-raw',
      },
      body: { value: parsed },
    };
  }

  if (isSnsEnvelope(parsed)) return parsed;

  const maybeMessage = parsed.Message;
  if (typeof maybeMessage === 'string') {
    const nested = tryParseJson(maybeMessage);
    if (isSnsEnvelope(nested)) return nested;
  } else if (isSnsEnvelope(maybeMessage)) {
    return maybeMessage;
  }

  return {
    metadata: {
      eventType: 'raw-message',
      eventId: `raw-${Date.now()}`,
      timestamp: new Date().toISOString(),
      partitionKey: 'unknown',
      schemaVersion: '1.0',
      source: 'sqs-raw',
    },
    body: parsed,
  };
}

let sqsClient: SQSClient | null = null;

function getSqsClient(): SQSClient {
  if (sqsClient) return sqsClient;

  sqsClient = new SQSClient({
    region: AWS_REGION,
    ...(AWS_ENDPOINT_URL ? { endpoint: AWS_ENDPOINT_URL } : {}),
  });

  return sqsClient;
}

async function receiveMessages(): Promise<Array<Pick<Message, 'Body' | 'ReceiptHandle'>>> {
  if (!SQS_QUEUE_URL) return [];
  const client = getSqsClient();
  const response = await client.send(
    new ReceiveMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: POLL_WAIT_SECONDS,
      VisibilityTimeout: 30,
    }),
  );
  return response.Messages ?? [];
}

async function deleteMessage(receiptHandle: string): Promise<void> {
  if (!SQS_QUEUE_URL) return;
  const client = getSqsClient();
  await client.send(
    new DeleteMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      ReceiptHandle: receiptHandle,
    }),
  );
}

function writeSseData(payload: unknown): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function writeSseComment(message: string): Uint8Array {
  return encoder.encode(`: ${message}\n\n`);
}

function writeSseError(reason: string): Uint8Array {
  return writeSseData({
    metadata: {
      eventType: 'stream-error',
      eventId: `stream-error-${Date.now()}`,
      timestamp: new Date().toISOString(),
      partitionKey: '-',
      schemaVersion: '1.0',
      source: 'sse-stream',
    },
    body: { reason },
  });
}

export async function GET(): Promise<Response> {
  if (!SQS_QUEUE_URL) {
    return new Response(
      'Missing SNS_STREAM_SQS_QUEUE_URL in server environment.',
      { status: 500 },
    );
  }

  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const safeEnqueue = (chunk: Uint8Array): boolean => {
        if (closed) return false;
        try {
          controller.enqueue(chunk);
          return true;
        } catch {
          closed = true;
          return false;
        }
      };

      const run = async () => {
        if (!safeEnqueue(writeSseComment('connected'))) return;

        while (!closed) {
          try {
            const messages = await receiveMessages();
            if (closed) return;

            if (messages.length === 0) {
              if (!safeEnqueue(writeSseComment('heartbeat'))) return;
              await sleep(IDLE_DELAY_MS);
              continue;
            }

            for (const msg of messages) {
              if (closed) return;
              if (!msg.Body) continue;

              const envelope = parseEnvelopeFromSqsBody(msg.Body);
              if (envelope) {
                if (!safeEnqueue(writeSseData(envelope))) return;
              }

              if (msg.ReceiptHandle) {
                await deleteMessage(msg.ReceiptHandle);
              }
            }
          } catch (error) {
            if (closed) return;
            const reason =
              error instanceof Error ? error.message : 'unknown stream error';
            if (!safeEnqueue(writeSseError(reason))) return;
            if (!safeEnqueue(writeSseComment(`error: ${reason}`))) return;
            await sleep(1500);
          }
        }
      };

      run().catch(() => {
        closed = true;
      });
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
