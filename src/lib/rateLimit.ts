/**
 * In-memory rate limiter for Next.js API routes.
 *
 * This is intentionally simple — it tracks attempts in a Map keyed by
 * `${routeKey}:${ip}` and is suitable for low/medium traffic single-instance
 * deployments. For multi-instance deployments (e.g. multiple Vercel regions),
 * a distributed store like Redis/Upstash would be more appropriate, but this
 * provides meaningful protection against brute force on the auth endpoints.
 */

import { NextRequest, NextResponse } from 'next/server';

type Bucket = {
  count: number;
  resetAt: number; // epoch ms
};

// Module-level Map persists across requests within the same server instance.
const buckets = new Map<string, Bucket>();

// Periodically remove expired entries so the Map cannot grow unbounded.
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweepExpired(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Best-effort client IP extraction. On Vercel/most reverse proxies the real
 * client IP is in `x-forwarded-for` (first entry) or `x-real-ip`.
 */
export function getClientIp(req: Request | NextRequest): string {
  const headers = req.headers;
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return 'unknown';
}

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Check whether the request from `ip` for `routeKey` should be rate limited.
 * Increments the counter when not yet limited.
 */
export function rateLimit(
  routeKey: string,
  ip: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);

  const key = `${routeKey}:${ip}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const bucket: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, bucket);
    return { limited: false, remaining: max - 1, resetAt: bucket.resetAt };
  }

  if (existing.count >= max) {
    return { limited: true, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { limited: false, remaining: max - existing.count, resetAt: existing.resetAt };
}

/**
 * Convenience helper that runs rateLimit and, if limited, returns a 429
 * NextResponse with a clear JSON message and standard rate-limit headers.
 * Returns `null` when the request is allowed to proceed.
 */
export function enforceRateLimit(
  req: Request | NextRequest,
  routeKey: string,
  max: number,
  windowMs: number
): NextResponse | null {
  const ip = getClientIp(req);
  const result = rateLimit(routeKey, ip, max, windowMs);

  if (result.limited) {
    const retryAfterSec = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      {
        error: 'Too many requests. Please wait a few minutes and try again.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSec),
          'X-RateLimit-Limit': String(max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}

// Common window presets
export const FIFTEEN_MINUTES = 15 * 60 * 1000;
