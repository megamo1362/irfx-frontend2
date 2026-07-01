import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'gsap', 'three'],
  },

  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // fallback runs AFTER Next.js checks its own route.ts files,
      // so /api/waitlist (and any future Next.js API routes) are served
      // by Next.js while all other /api/* paths proxy to the Python backend.
      fallback: [
        { source: '/api/:path*', destination: 'http://127.0.0.1:8000/:path*' },
      ],
    };
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

export default bundleAnalyzer(nextConfig);
