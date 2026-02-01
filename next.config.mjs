/** @type {import('next').NextConfig} */
const nextConfig = {
  // SEO & Security Headers
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'lego-menswear-backend-abf196114bd9.herokuapp.com',
      },
      {
        protocol: 'https',
        hostname: '**.herokuapp.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // CRITICAL: Disable optimization for external images (fixes CORS issues)
    unoptimized: true,
  },

  // HTTP Headers for SEO & Security
  async headers() {
    return [
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      // Add any URL restructuring redirects here
      // Example: old URLs to new URLs with 301 redirects
    ];
  },
};

export default nextConfig;
