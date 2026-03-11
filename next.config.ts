import type { NextConfig } from 'next';

const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1/';
const usesRelativeApiBase = publicApiBaseUrl.trim().startsWith('/v1');
const defaultProxyTarget =
  process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:3000' : undefined;
const apiProxyTarget = (process.env.API_PROXY_TARGET ?? defaultProxyTarget)?.replace(/\/+$/, '');

if (process.env.NODE_ENV === 'production' && usesRelativeApiBase && !apiProxyTarget) {
  throw new Error(
    'Missing API_PROXY_TARGET. Set API_PROXY_TARGET for /v1 proxy or set NEXT_PUBLIC_API_BASE_URL to an absolute API URL in production.',
  );
}

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxyTarget) return [];
    return [
      {
        source: '/v1/:path*',
        destination: `${apiProxyTarget}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
