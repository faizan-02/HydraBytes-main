/**
 * Shared input validation & sanitization helpers used by API routes.
 *
 * Goals:
 *  - Reject obviously malicious / oversized payloads early
 *  - Strip HTML / script tags from free-form text fields
 *  - Provide a consistent way to escape user content embedded in HTML emails
 *  - Validate email format + OTP shape
 */

import { NextResponse } from 'next/server';

// ---------- Length limits ----------
export const LIMITS = {
  NAME_MAX: 100,
  EMAIL_MAX: 254, // RFC 5321
  PASSWORD_MAX: 128,
  PASSWORD_MIN: 8,
  MESSAGE_MAX: 5000,
  SERVICE_MAX: 100,
  BUDGET_MAX: 100,
  TRANSACTION_REF_MAX: 200,
  REASON_MAX: 1000,
  OTP_LENGTH: 6,
  TOKEN_MAX: 256,
  // Hard cap on raw JSON body bytes accepted by API routes
  MAX_BODY_BYTES: 16 * 1024, // 16 KB is plenty for any of our forms
} as const;

// ---------- Primitive helpers ----------

/**
 * Strip HTML tags and dangerous control characters from a string.
 * Use for any free-form text field stored in the DB or echoed back.
 */
export function stripTags(input: string): string {
  return input
    // Remove HTML/XML tags entirely
    .replace(/<[^>]*>/g, '')
    // Remove null bytes & most control chars (keep \n, \r, \t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Escape a string for safe interpolation into HTML (e.g. transactional emails).
 * Always run user-provided values through this before embedding in HTML strings.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= LIMITS.EMAIL_MAX &&
    EMAIL_RE.test(value)
  );
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isString(value: unknown, min = 1, max = Number.MAX_SAFE_INTEGER): value is string {
  return typeof value === 'string' && value.length >= min && value.length <= max;
}

export function isOtp(value: unknown): value is string {
  return typeof value === 'string' && /^\d{6}$/.test(value.trim());
}

// ---------- Request guards ----------

/**
 * Reject requests whose Content-Type is not application/json.
 * Returns a NextResponse to send back, or null if the type is acceptable.
 */
export function requireJson(req: Request): NextResponse | null {
  const ct = req.headers.get('content-type') ?? '';
  if (!ct.toLowerCase().includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json.' },
      { status: 415 }
    );
  }
  // Optional Content-Length check — body size enforced again after read.
  const cl = req.headers.get('content-length');
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > LIMITS.MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request body too large.' }, { status: 413 });
    }
  }
  return null;
}

/**
 * Read and parse a JSON body, enforcing a max byte size and returning a
 * tagged result. Use:
 *
 *   const parsed = await readJsonBody(req);
 *   if (!parsed.ok) return parsed.response;
 *   const body = parsed.data;
 */
export async function readJsonBody<T = unknown>(
  req: Request,
  maxBytes = LIMITS.MAX_BODY_BYTES
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  try {
    const text = await req.text();
    if (text.length > maxBytes) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Request body too large.' }, { status: 413 }),
      };
    }
    if (!text) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Request body is required.' }, { status: 400 }),
      };
    }
    const data = JSON.parse(text) as T;
    if (data === null || typeof data !== 'object') {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }),
      };
    }
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }),
    };
  }
}

// ---------- Compound field validators ----------

export type FieldError = { error: string; status: number };

export function validateName(value: unknown): { ok: true; value: string } | FieldError {
  if (typeof value !== 'string') return { error: 'Name is required.', status: 400 };
  const cleaned = stripTags(value);
  if (cleaned.length === 0) return { error: 'Name is required.', status: 400 };
  if (cleaned.length > LIMITS.NAME_MAX) {
    return { error: `Name must be at most ${LIMITS.NAME_MAX} characters.`, status: 400 };
  }
  return { ok: true, value: cleaned };
}

export function validateEmail(value: unknown): { ok: true; value: string } | FieldError {
  if (typeof value !== 'string') return { error: 'Email is required.', status: 400 };
  const trimmed = value.trim();
  if (!isValidEmail(trimmed)) {
    return { error: 'Invalid email address.', status: 400 };
  }
  return { ok: true, value: trimmed.toLowerCase() };
}

export function validatePassword(value: unknown): { ok: true; value: string } | FieldError {
  if (typeof value !== 'string') return { error: 'Password is required.', status: 400 };
  if (value.length < LIMITS.PASSWORD_MIN) {
    return { error: `Password must be at least ${LIMITS.PASSWORD_MIN} characters.`, status: 400 };
  }
  if (value.length > LIMITS.PASSWORD_MAX) {
    return { error: `Password must be at most ${LIMITS.PASSWORD_MAX} characters.`, status: 400 };
  }
  return { ok: true, value };
}

export function validateMessage(value: unknown): { ok: true; value: string } | FieldError {
  if (typeof value !== 'string') return { error: 'Message is required.', status: 400 };
  const cleaned = stripTags(value);
  if (cleaned.length === 0) return { error: 'Message is required.', status: 400 };
  if (cleaned.length > LIMITS.MESSAGE_MAX) {
    return { error: `Message must be at most ${LIMITS.MESSAGE_MAX} characters.`, status: 400 };
  }
  return { ok: true, value: cleaned };
}

export function validateOtp(value: unknown): { ok: true; value: string } | FieldError {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return { error: 'OTP is required.', status: 400 };
  }
  const str = String(value).trim();
  if (!isOtp(str)) {
    return { error: 'OTP must be 6 digits.', status: 400 };
  }
  return { ok: true, value: str };
}

export function validateShortText(
  value: unknown,
  fieldName: string,
  max: number
): { ok: true; value: string } | FieldError {
  if (typeof value !== 'string') return { error: `${fieldName} is required.`, status: 400 };
  const cleaned = stripTags(value);
  if (cleaned.length === 0) return { error: `${fieldName} is required.`, status: 400 };
  if (cleaned.length > max) {
    return { error: `${fieldName} must be at most ${max} characters.`, status: 400 };
  }
  return { ok: true, value: cleaned };
}

export function validateOptionalShortText(
  value: unknown,
  fieldName: string,
  max: number
): { ok: true; value: string } | FieldError {
  if (value === undefined || value === null || value === '') return { ok: true, value: '' };
  if (typeof value !== 'string') return { error: `${fieldName} must be a string.`, status: 400 };
  const cleaned = stripTags(value);
  if (cleaned.length > max) {
    return { error: `${fieldName} must be at most ${max} characters.`, status: 400 };
  }
  return { ok: true, value: cleaned };
}

export function validateToken(value: unknown): { ok: true; value: string } | FieldError {
  if (typeof value !== 'string') return { error: 'Invalid token.', status: 400 };
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > LIMITS.TOKEN_MAX) {
    return { error: 'Invalid token.', status: 400 };
  }
  // Tokens are hex/base64-ish — reject anything outside that charset
  if (!/^[A-Za-z0-9._\-+/=]+$/.test(trimmed)) {
    return { error: 'Invalid token.', status: 400 };
  }
  return { ok: true, value: trimmed };
}

/**
 * Constant-time string comparison to mitigate timing attacks on token checks.
 */
export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
