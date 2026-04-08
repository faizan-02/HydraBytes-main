import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const token = await prisma.emailVerificationToken.findFirst({
      where: { email: normalizedEmail },
    });

    if (!token) {
      return NextResponse.json({ error: 'No verification code found. Please request a new one.' }, { status: 400 });
    }

    if (new Date() > token.expiresAt) {
      await prisma.emailVerificationToken.delete({ where: { id: token.id } });
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 });
    }

    if (token.otp !== otp.toString().trim()) {
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
