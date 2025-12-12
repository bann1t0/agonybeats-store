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

  /* Remove console.log in production */
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],  // Keep console.error and console.warn
    } : false,
  },

  /* Turbopack Configuration (Next.js 16+) */
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
