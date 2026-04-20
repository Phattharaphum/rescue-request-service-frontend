import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_COOKIE_VALUE,
} from '@/lib/config/admin-auth';

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  const authenticated = cookieValue === ADMIN_AUTH_COOKIE_VALUE;
  return NextResponse.json({ authenticated });
}
