import { NextRequest, NextResponse } from 'next/server';

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`;
}

function resolveApiBaseUrl(request: NextRequest): string {
  const proxyTarget = process.env.API_PROXY_TARGET?.trim();
  if (proxyTarget) {
    return normalizeBaseUrl(proxyTarget);
  }

  const publicBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!publicBase) return '';

  if (publicBase.startsWith('http://') || publicBase.startsWith('https://')) {
    return normalizeBaseUrl(publicBase);
  }

  const relative = publicBase.startsWith('/') ? publicBase : `/${publicBase}`;
  return normalizeBaseUrl(`${request.nextUrl.origin}${relative}`);
}

export async function GET(request: NextRequest) {
  const apiBaseUrl = resolveApiBaseUrl(request);

  if (!apiBaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'ไม่พบค่า API base URL สำหรับทดสอบ (โปรดตั้ง API_PROXY_TARGET หรือ NEXT_PUBLIC_API_BASE_URL)',
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
