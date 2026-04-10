import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */

// Baseline security headers applied to every response.
// CSP intentionally allows 'unsafe-inline' for style/script because the app
// uses inline JSON-LD <script> tags and inline styles in transactional emails
// rendered by API routes. Tightening further would require a nonce strategy.
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Prevent Cloudflare/CDN from caching auth endpoints (CSRF tokens must always be fresh)
        source: '/api/auth/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ];
  },
  async redirects() {
    return [
      {
        // Redirect non-www to www — but NOT for auth API routes (OAuth callbacks must
        // not be redirected mid-flow or the state/redirect_uri will mismatch).
        source: '/((?!api/auth).*)',
        has: [{ type: 'host', value: 'hydrabytes.it.com' }],
        destination: 'https://www.hydrabytes.it.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // Disable source map upload unless SENTRY_AUTH_TOKEN is set
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  disableLogger: true,
});
