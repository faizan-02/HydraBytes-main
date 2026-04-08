import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified.' }, { status: 400 });
    }

    await prisma.emailVerificationToken.deleteMany({ where: { email: normalizedEmail } });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: { email: normalizedEmail, otp, expiresAt },
    });

    await resend.emails.send({
      from: 'HydraBytes <hello@hydrabytes.it.com>',
      to: normalizedEmail,
      subject: 'Your HydraBytes verification code',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">Verify Your Email</h1>
          </div>
          <div style="padding: 40px 32px;">
            <p style="font-size: 16px; color: #a0a0b8; margin: 0 0 16px;">Hi ${user.name ?? 'there'},</p>
            <p style="font-size: 16px; line-height: 1.7; color: #a0a0b8; margin: 0 0 24px;">
              Use the code below to verify your email address.
            </p>
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; padding: 20px 40px; background: rgba(124,58,237,0.15); border: 2px solid rgba(124,58,237,0.4); border-radius: 12px;">
                <span style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #ffffff;">${otp}</span>
              </div>
            </div>
            <div style="background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 10px; padding: 16px;">
              <p style="margin: 0; font-size: 13px; color: #a0a0b8;">
                This code expires in <strong style="color: #f0f0f5;">15 minutes</strong>. If you did not create an account, you can safely ignore this email.
              </p>
            </div>
          </div>
          <div style="padding: 24px 32px; border-top: 1px solid rgba(124,58,237,0.15); text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #6c6c85;">© ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
