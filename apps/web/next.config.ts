import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // In development, use unoptimized images from localhost Strapi
    // to avoid "private ip" security restrictions
    unoptimized: isDev,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.strapiapp.com',
        pathname: '/uploads/**',
      },
      // Yandex Cloud Object Storage
      {
        protocol: 'https',
        hostname: 'storage.yandexcloud.net',
        pathname: '/**',
      },
      // Yandex Cloud Serverless Containers (for Strapi uploads)
      {
        protocol: 'https',
        hostname: '*.serverless.yandexcloud.net',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
