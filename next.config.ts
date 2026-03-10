import type { NextConfig } from 'next';

const apiProxyTarget = (
  process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:3000'
).replace(/\/+$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: `${apiProxyTarget}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
