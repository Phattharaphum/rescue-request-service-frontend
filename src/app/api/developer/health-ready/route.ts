import { NextResponse } from 'next/server';

function resolveApiBaseUrlFromProxyTarget(apiProxyTarget: string | undefined): string {
  const trimmed = apiProxyTarget?.trim() ?? '';
  if (!trimmed) return '';

  const withoutTrailingSlashes = trimmed.replace(/\/+$/, '');
  return withoutTrailingSlashes.endsWith('/v1')
    ? withoutTrailingSlashes
    : `${withoutTrailingSlashes}/v1`;
}

export async function GET() {
  const apiBaseUrl = resolveApiBaseUrlFromProxyTarget(process.env.API_PROXY_TARGET);

  if (!apiBaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        message: 'ไม่พบค่า API_PROXY_TARGET ใน environment',
      },
      { status: 500 },
    );
  }

  const healthUrl = `${apiBaseUrl}/health/ready`;
  const startedAt = Date.now();

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    const latencyMs = Date.now() - startedAt;
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: `ตรวจสอบไม่สำเร็จ (HTTP ${response.status})`,
          healthUrl,
          latencyMs,
          payload,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      healthUrl,
      latencyMs,
      payload,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: 'เชื่อมต่อ API ไม่สำเร็จ',
        healthUrl,
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
