import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Find user (only users with passwords can reset — OAuth users cannot)
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (user && user.password) {
    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email: normalizedEmail } });

    // Create new token (expires in 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { email: normalizedEmail, token, expiresAt },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
    const userName = user.name ?? 'there';

    await resend.emails.send({
      from: 'HydraBytes <onboarding@resend.dev>',
      to: normalizedEmail,
      subject: 'Reset your HydraBytes password',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">Password Reset</h1>
          </div>
          <div style="padding: 40px 32px;">
            <p style="font-size: 16px; color: #a0a0b8; margin: 0 0 16px;">Hi ${userName},</p>
            <p style="font-size: 16px; line-height: 1.7; color: #a0a0b8; margin: 0 0 24px;">
              We received a request to reset your HydraBytes account password. Click the button below to create a new password.
            </p>
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px;">
                Reset Password
              </a>
            </div>
            <div style="background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 10px; padding: 16px;">
              <p style="margin: 0; font-size: 13px; color: #a0a0b8;">
                This link expires in <strong style="color: #f0f0f5;">1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
              </p>
            </div>
          </div>
          <div style="padding: 24px 32px; border-top: 1px solid rgba(124,58,237,0.15); text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #6c6c85;">© ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
          </div>
        </div>
      `,
    }).catch(() => {
      // Silently fail — don't reveal whether email was sent
    });
  }

  // Always return 200 to avoid revealing whether the email exists
  return NextResponse.json({ success: true }, { status: 200 });
}
