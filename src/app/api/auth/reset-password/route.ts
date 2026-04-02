import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password || typeof token !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

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
