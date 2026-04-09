import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { enforceRateLimit, FIFTEEN_MINUTES } from '@/lib/rateLimit';
import { readJsonBody, requireJson, validateName, validatePassword, validatePhone, validateCompany, validateEmail } from '@/lib/validate';

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

// PATCH — update name or password
export async function PATCH(req: NextRequest) {
  const limited = enforceRateLimit(req, 'user:settings', 10, FIFTEEN_MINUTES);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const ctGuard = requireJson(req);
  if (ctGuard) return ctGuard;

  const parsed = await readJsonBody<{ action?: unknown; name?: unknown; currentPassword?: unknown; newPassword?: unknown; phone?: unknown; company?: unknown; newEmail?: unknown }>(req);
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
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return NextResponse.json({ success: true });
  }

  // ── Update Profile (phone + company) ─────────────────────────────────────
  if (action === 'update_profile') {
    const phoneRes = validatePhone(parsed.data.phone);
    if ('error' in phoneRes) return NextResponse.json({ error: phoneRes.error }, { status: phoneRes.status });

    const companyRes = validateCompany(parsed.data.company);
    if ('error' in companyRes) return NextResponse.json({ error: companyRes.error }, { status: companyRes.status });

    await prisma.user.update({ where: { id: userId }, data: { phone: phoneRes.value, company: companyRes.value } });
    return NextResponse.json({ success: true });
  }

  // ── Update Info (name + phone + company, any subset) ─────────────────────
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

  // ── Change Email ──────────────────────────────────────────────────────────
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

    const existing = await prisma.user.findUnique({ where: { email: emailRes.value } });
    if (existing) return NextResponse.json({ error: 'That email address is already in use.' }, { status: 409 });

    await prisma.user.update({ where: { id: userId }, data: { email: emailRes.value } });
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

  // Cascade delete — sessions, invoices, projects, then user
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.invoice.deleteMany({ where: { userId } });
  await prisma.project.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
