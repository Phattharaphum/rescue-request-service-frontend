import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_COOKIE_VALUE,
} from './src/lib/config/admin-auth';

function isAdminAuthenticated(request: NextRequest): boolean {
  return request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value === ADMIN_AUTH_COOKIE_VALUE;
}

function redirectWithPreservedQuery(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

function resolveAdminNextPath(nextParam: string | null): string {
  if (!nextParam) return '/admin/incident';

  const normalized = nextParam.trim();
  if (!normalized.startsWith('/admin')) return '/admin/incident';
  if (normalized === '/admin/login' || normalized.startsWith('/admin/login?')) {
    return '/admin/incident';
  }

  return normalized;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/pubsub' || pathname.startsWith('/pubsub/')) {
    const suffix = pathname.slice('/pubsub'.length);
    return redirectWithPreservedQuery(request, `/admin/pubsub${suffix}`);
  }

  if (pathname === '/staff' || pathname.startsWith('/staff/')) {
    if (pathname === '/staff' || pathname === '/staff/') {
      return redirectWithPreservedQuery(request, '/admin/incident');
    }

    if (pathname === '/staff/incidents' || pathname.startsWith('/staff/incidents/')) {
      const suffix = pathname.slice('/staff/incidents'.length);
      return redirectWithPreservedQuery(request, `/admin/incident${suffix}`);
    }

    const suffix = pathname.slice('/staff'.length);
    return redirectWithPreservedQuery(request, `/admin/incident${suffix}`);
  }

  if (pathname === '/admin/login') {
    if (isAdminAuthenticated(request)) {
      const destination = resolveAdminNextPath(request.nextUrl.searchParams.get('next'));
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  if (pathname === '/admin' || pathname === '/admin/') {
    return redirectWithPreservedQuery(request, '/admin/incident');
  }

  if (pathname.startsWith('/admin/')) {
    if (!isAdminAuthenticated(request)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('next', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/staff',
    '/staff/:path*',
    '/pubsub',
    '/pubsub/:path*',
  ],
};
