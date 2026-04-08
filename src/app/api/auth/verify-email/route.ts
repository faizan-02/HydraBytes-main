import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enforceRateLimit, rateLimit, FIFTEEN_MINUTES } from '@/lib/rateLimit';
import {
  readJsonBody,
  requireJson,
  validateEmail,
  validateOtp,
  timingSafeEqualStr,
} from '@/lib/validate';

// Per-email lockout: max 8 wrong OTPs in 15 min before we drop the token.
const MAX_OTP_ATTEMPTS_PER_EMAIL = 8;

export async function POST(req: NextRequest) {
  // IP-based rate limit (5 / 15 min)
  const limited = enforceRateLimit(req, 'auth:verify-email', 5, FIFTEEN_MINUTES);
  if (limited) return limited;

  const ctGuard = requireJson(req);
  if (ctGuard) return ctGuard;

  const parsed = await readJsonBody<{ email?: unknown; otp?: unknown }>(req);
  if (!parsed.ok) return parsed.response;

  const emailRes = validateEmail(parsed.data.email);
  if ('error' in emailRes) return NextResponse.json({ error: emailRes.error }, { status: emailRes.status });
  const otpRes = validateOtp(parsed.data.otp);
  if ('error' in otpRes) return NextResponse.json({ error: otpRes.error }, { status: otpRes.status });

  const normalizedEmail = emailRes.value;
  const submittedOtp = otpRes.value;

  try {
    const token = await prisma.emailVerificationToken.findFirst({
      where: { email: normalizedEmail },
    });

    if (!token) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    if (new Date() > token.expiresAt) {
      await prisma.emailVerificationToken.delete({ where: { id: token.id } });
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 });
    }

    // Per-email attempt tracking — defends against distributed brute-force
    // (i.e. attacker rotating IPs against the same OTP).
    const emailAttempts = rateLimit(
      'auth:verify-email:email',
      normalizedEmail,
      MAX_OTP_ATTEMPTS_PER_EMAIL,
      FIFTEEN_MINUTES
    );
    if (emailAttempts.limited) {
      // Lockout: invalidate the token entirely so the user must request a new one
      await prisma.emailVerificationToken.delete({ where: { id: token.id } }).catch(() => {});
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    // Constant-time comparison to avoid timing leaks on the OTP check
    if (!timingSafeEqualStr(token.otp, submittedOtp)) {
      return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: true },
    });

    await prisma.emailVerificationToken.delete({ where: { id: token.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
