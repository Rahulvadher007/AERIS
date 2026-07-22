import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'tile.openstreetmap.org' },
      { protocol: 'https', hostname: '*.tile.openstreetmap.org' },
      { protocol: 'https', hostname: 'cartodb-basemaps-a.global.ssl.fastly.net' },
      { protocol: 'https', hostname: 'cartodb-basemaps-b.global.ssl.fastly.net' },
      { protocol: 'https', hostname: 'cartodb-basemaps-c.global.ssl.fastly.net' },
    ],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:3001'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
