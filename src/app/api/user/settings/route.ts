import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { enforceRateLimit, FIFTEEN_MINUTES } from '@/lib/rateLimit';
import { readJsonBody, requireJson, validateName, validatePassword } from '@/lib/validate';

// PATCH — update name or password
export async function PATCH(req: NextRequest) {
  const limited = enforceRateLimit(req, 'user:settings', 10, FIFTEEN_MINUTES);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const ctGuard = requireJson(req);
  if (ctGuard) return ctGuard;

  const parsed = await readJsonBody<{ action?: unknown; name?: unknown; currentPassword?: unknown; newPassword?: unknown }>(req);
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
