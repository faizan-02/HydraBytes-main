import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,
  // Capture 100% of errors
  sampleRate: 1.0,
  // Don't initialize if no DSN is provided
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Ignore common non-actionable errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    /^(Network Error|Failed to fetch|Load failed)$/,
  ],
});
