import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { enforceRateLimit, FIFTEEN_MINUTES } from '@/lib/rateLimit';
import {
  readJsonBody,
  requireJson,
  validatePassword,
  validateToken,
} from '@/lib/validate';

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, 'auth:reset-password', 5, FIFTEEN_MINUTES);
  if (limited) return limited;

  const ctGuard = requireJson(req);
  if (ctGuard) return ctGuard;

  const parsed = await readJsonBody<{ token?: unknown; password?: unknown }>(req);
  if (!parsed.ok) return parsed.response;

  const tokenRes = validateToken(parsed.data.token);
  if ('error' in tokenRes) return NextResponse.json({ error: tokenRes.error }, { status: tokenRes.status });
  const passwordRes = validatePassword(parsed.data.password);
  if ('error' in passwordRes) return NextResponse.json({ error: passwordRes.error }, { status: passwordRes.status });

  const token = tokenRes.value;
  const password = passwordRes.value;

  // Find token
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken) {
    return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
  }

  // Check expiry
  if (new Date() > resetToken.expiresAt) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Update user password
  await prisma.user.update({
    where: { email: resetToken.email },
    data: { password: hashedPassword },
  });

  // Delete the token
  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ success: true }, { status: 200 });
}
