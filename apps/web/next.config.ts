import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';
const isPreview = process.env.DEPLOY_ENV === 'preview';

const nextConfig: NextConfig = {
  output: 'standalone',
  skipTrailingSlashRedirect: true,
  async headers() {
    const headers = [
      {
        source: '/docs/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/_next/image',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];

    if (!isPreview) {
      return headers;
    }

    // Prevent search engines from indexing ephemeral PR preview deployments.
    return [
      ...headers,
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  images: {
    // Keep unoptimized in dev for faster iteration.
    unoptimized: isDev,
    remotePatterns: [
      // Yandex Cloud Object Storage
      {
        protocol: 'https',
        hostname: 'storage.yandexcloud.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.storage.yandexcloud.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
