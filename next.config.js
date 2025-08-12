/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/surveys',
  eslint: {
    // Allow production builds to succeed even if ESLint errors exist
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to succeed even if type errors exist
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  async rewrites() {
    return [
      // Ensure client fetch('/api/...') works under basePath '/surveys'
      { source: '/api/:path*', destination: '/surveys/api/:path*' },
    ];
  },
};

module.exports = nextConfig;


