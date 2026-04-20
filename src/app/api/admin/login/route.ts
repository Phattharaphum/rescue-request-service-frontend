import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_AUTH_COOKIE_MAX_AGE_SECONDS,
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_COOKIE_VALUE,
  ADMIN_PASSWORD,
} from '@/lib/config/admin-auth';

interface LoginBody {
  password?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const inputPassword = typeof body.password === 'string' ? body.password : '';

  if (inputPassword !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, message: 'รหัสผ่านไม่ถูกต้อง' },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE_NAME,
    value: ADMIN_AUTH_COOKIE_VALUE,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_AUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
