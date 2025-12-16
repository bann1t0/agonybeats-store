/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Image Optimization */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /* Performance Optimizations */
  compress: true,

  /* Strict Mode */
  reactStrictMode: true,

  /* Keep console.log for debugging - important for production issues */
  compiler: {
    removeConsole: false,
  },

  /* Server external packages for AWS SDK */
  serverExternalPackages: ['@aws-sdk/client-s3'],

  /* Experimental features for large file uploads */
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  /* Turbopack Configuration (Next.js 16+) */
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

