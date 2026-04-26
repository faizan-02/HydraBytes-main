import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { enforceRateLimit, rateLimit, FIFTEEN_MINUTES } from '@/lib/rateLimit';
import { readJsonBody, requireJson, validateName, validatePassword, validatePhone, validateCompany, validateEmail, escapeHtml, timingSafeEqualStr } from '@/lib/validate';
import { sendEmail } from '@/lib/mailer';

// GET — fetch current profile data
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true, company: true },
  });
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  return NextResponse.json(user);
}

// PATCH — update name, password, profile, email
export async function PATCH(req: NextRequest) {
  const limited = enforceRateLimit(req, 'user:settings', 10, FIFTEEN_MINUTES);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const ctGuard = requireJson(req);
  if (ctGuard) return ctGuard;

  const parsed = await readJsonBody<{
    action?: unknown;
    name?: unknown;
    currentPassword?: unknown;
    newPassword?: unknown;
    phone?: unknown;
    company?: unknown;
    newEmail?: unknown;
    otp?: unknown;
  }>(req);
  if (!parsed.ok) return parsed.response;

  const { action } = parsed.data;
  const userId = (session.user as { id: string }).id;

  // ── Change Name ──────────────────────────────────────────────────────────
  if (action === 'update_name') {
    const nameRes = validateName(parsed.data.name);
    if ('error' in nameRes) return NextResponse.json({ error: nameRes.error }, { status: nameRes.status });

    await prisma.user.update({ where: { id: userId }, data: { name: nameRes.value } });
    return NextResponse.json({ success: true });
  }

  // ── Change Password ───────────────────────────────────────────────────────
  if (action === 'update_password') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password) {
      return NextResponse.json({ error: 'Password change is not available for social login accounts.' }, { status: 400 });
    }

    const currentPasswordRes = validatePassword(parsed.data.currentPassword);
    if ('error' in currentPasswordRes) return NextResponse.json({ error: 'Current password is required.' }, { status: 400 });

    const newPasswordRes = validatePassword(parsed.data.newPassword);
    if ('error' in newPasswordRes) return NextResponse.json({ error: newPasswordRes.error }, { status: newPasswordRes.status });

    const match = await bcrypt.compare(currentPasswordRes.value, user.password);
    if (!match) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });

    if (currentPasswordRes.value === newPasswordRes.value) {
      return NextResponse.json({ error: 'New password must be different from current password.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPasswordRes.value, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed, passwordChangedAt: new Date() } });
    return NextResponse.json({ success: true });
  }

  // ── Update Profile (phone + company — used by onboarding flow) ────────────
  if (action === 'update_profile') {
    const phoneRes = validatePhone(parsed.data.phone);
    if ('error' in phoneRes) return NextResponse.json({ error: phoneRes.error }, { status: phoneRes.status });

    const companyRes = validateCompany(parsed.data.company);
    if ('error' in companyRes) return NextResponse.json({ error: companyRes.error }, { status: companyRes.status });

    await prisma.user.update({ where: { id: userId }, data: { phone: phoneRes.value, company: companyRes.value } });
    return NextResponse.json({ success: true });
  }

  // ── Update Info (name + phone + company, any non-empty subset) ───────────
  if (action === 'update_info') {
    const updateData: { name?: string; phone?: string; company?: string } = {};

    const { name, phone, company } = parsed.data;
    if (name !== undefined && name !== '') {
      const nameRes = validateName(name);
      if ('error' in nameRes) return NextResponse.json({ error: nameRes.error }, { status: nameRes.status });
      updateData.name = nameRes.value;
    }
    if (phone !== undefined && phone !== '') {
      const phoneRes = validatePhone(phone);
      if ('error' in phoneRes) return NextResponse.json({ error: phoneRes.error }, { status: phoneRes.status });
      updateData.phone = phoneRes.value;
    }
    if (company !== undefined && company !== '') {
      const companyRes = validateCompany(company);
      if ('error' in companyRes) return NextResponse.json({ error: companyRes.error }, { status: companyRes.status });
      updateData.company = companyRes.value;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
    }

    await prisma.user.update({ where: { id: userId }, data: updateData });
    return NextResponse.json({ success: true, updatedName: updateData.name });
  }

  // ── Request Email Change — send OTP to new address ───────────────────────
  if (action === 'update_email') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password) {
      return NextResponse.json({ error: 'Email change is not available for social login accounts.' }, { status: 400 });
    }

    const emailRes = validateEmail(parsed.data.newEmail);
    if ('error' in emailRes) return NextResponse.json({ error: emailRes.error }, { status: emailRes.status });

    if (emailRes.value.toLowerCase() === user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'New email must be different from your current email.' }, { status: 400 });
    }

    const currentPasswordRes = validatePassword(parsed.data.currentPassword);
    if ('error' in currentPasswordRes) return NextResponse.json({ error: 'Current password is required.' }, { status: 400 });

    const match = await bcrypt.compare(currentPasswordRes.value, user.password);
    if (!match) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });

    // Case-insensitive uniqueness check
    const existing = await prisma.user.findFirst({
      where: { email: { equals: emailRes.value, mode: 'insensitive' } },
    });
    if (existing) return NextResponse.json({ error: 'That email address is already in use.' }, { status: 409 });

    // Cryptographically secure OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.emailChangeToken.upsert({
      where: { userId },
      create: { userId, newEmail: emailRes.value, otp, expiresAt },
      update: { newEmail: emailRes.value, otp, expiresAt },
    });

    const safeName = escapeHtml(user.name ?? 'there');
    const safeEmail = escapeHtml(emailRes.value);
    await sendEmail({
      to: emailRes.value,
      subject: 'Confirm your new HydraBytes email address',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">Confirm Email Change</h1>
          </div>
          <div style="padding: 40px 32px;">
            <p style="font-size: 16px; color: #a0a0b8; margin: 0 0 16px;">Hi ${safeName},</p>
            <p style="font-size: 16px; line-height: 1.7; color: #a0a0b8; margin: 0 0 8px;">
              You requested to change your HydraBytes email address to:
            </p>
            <p style="font-size: 15px; font-weight: 600; color: #ffffff; margin: 0 0 24px;">${safeEmail}</p>
            <p style="font-size: 16px; line-height: 1.7; color: #a0a0b8; margin: 0 0 24px;">
              Enter the verification code below to confirm this change.
            </p>
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; padding: 20px 40px; background: rgba(99,102,241,0.15); border: 2px solid rgba(99,102,241,0.4); border-radius: 12px;">
                <span style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #ffffff;">${otp}</span>
              </div>
            </div>
            <div style="background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 10px; padding: 16px;">
              <p style="margin: 0; font-size: 13px; color: #a0a0b8;">
                This code expires in <strong style="color: #f0f0f5;">15 minutes</strong>. If you did not request this change, you can safely ignore this email.
              </p>
            </div>
          </div>
          <div style="padding: 24px 32px; border-top: 1px solid rgba(99,102,241,0.15); text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #6c6c85;">© ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ pending: true });
  }

  // ── Verify Email Change OTP ───────────────────────────────────────────────
  if (action === 'verify_email_change') {
    // Per-user brute-force protection (5 wrong attempts per 15 min)
    const otpRateCheck = rateLimit('user:verify-email-change', userId, 5, FIFTEEN_MINUTES);
    if (otpRateCheck.limited) {
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new verification code.' },
        { status: 429 }
      );
    }

    const otpInput = typeof parsed.data.otp === 'string' ? parsed.data.otp.trim() : '';
    if (!otpInput) return NextResponse.json({ error: 'Verification code is required.' }, { status: 400 });

    const token = await prisma.emailChangeToken.findUnique({ where: { userId } });
    if (!token) return NextResponse.json({ error: 'No pending email change found. Please start over.' }, { status: 400 });

    if (new Date() > token.expiresAt) {
      await prisma.emailChangeToken.delete({ where: { userId } });
      return NextResponse.json({ error: 'Verification code has expired. Please start over.' }, { status: 400 });
    }

    // Constant-time OTP comparison
    if (!timingSafeEqualStr(token.otp, otpInput)) {
      return NextResponse.json({ error: 'Incorrect verification code.' }, { status: 400 });
    }

    // Case-insensitive check that new email is still available
    const conflict = await prisma.user.findFirst({
      where: { email: { equals: token.newEmail, mode: 'insensitive' } },
    });
    if (conflict) {
      await prisma.emailChangeToken.delete({ where: { userId } });
      return NextResponse.json({ error: 'That email address is no longer available.' }, { status: 409 });
    }

    // Fetch old email before update (needed for cleanup)
    const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    const oldEmail = currentUser?.email;

    // Update email and invalidate existing sessions
    try {
      await prisma.user.update({ where: { id: userId }, data: { email: token.newEmail, passwordChangedAt: new Date() } });
    } catch (err) {
      if ((err as { code?: string }).code === 'P2002') {
        await prisma.emailChangeToken.delete({ where: { userId } });
        return NextResponse.json({ error: 'That email address is no longer available.' }, { status: 409 });
      }
      throw err;
    }

    // Clean up token
    await prisma.emailChangeToken.delete({ where: { userId } });

    if (oldEmail) {
      await Promise.all([
        // Invalidate any password reset tokens tied to the old email
        prisma.passwordResetToken.deleteMany({
          where: { email: { equals: oldEmail, mode: 'insensitive' } },
        }),
        // Update ContactSubmission records so admin invite flow still works
        prisma.contactSubmission.updateMany({
          where: { email: { equals: oldEmail, mode: 'insensitive' } },
          data: { email: token.newEmail },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
}

// DELETE — delete account
export async function DELETE(req: NextRequest) {
  const limited = enforceRateLimit(req, 'user:delete', 3, FIFTEEN_MINUTES);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

  await prisma.emailChangeToken.deleteMany({ where: { userId } });
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.invoice.deleteMany({ where: { userId } });
  await prisma.project.deleteMany({ where: { userId } });

  if (user?.email) {
    await Promise.all([
      prisma.emailVerificationToken.deleteMany({ where: { email: user.email } }),
      prisma.passwordResetToken.deleteMany({ where: { email: user.email } }),
    ]);
  }

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
