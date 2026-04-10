import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mailer';
import { escapeHtml } from '@/lib/validate';

const BASE_URL = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://hydrabytes.it.com';
const TEAM_EMAIL = process.env.TEAM_EMAIL!;
const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP ?? '923239999000'}`;

// Vercel invokes cron routes with a secret header to prevent public access
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const reminders: string[] = [];

  // ── 1. Projects stuck in "accepted" for 48+ hours ────────────────────────
  const stuckAccepted = await prisma.project.findMany({
    where: { status: 'accepted', createdAt: { lt: twoDaysAgo } },
    include: { user: { select: { name: true, email: true } } },
  });

  if (stuckAccepted.length > 0) {
    const list = stuckAccepted.map(p =>
      `• ${escapeHtml(p.title)} — ${escapeHtml(p.user?.name ?? 'Unknown')} (${escapeHtml(p.user?.email ?? '')})`
    ).join('<br/>');

    await sendEmail({
      to: TEAM_EMAIL,
      subject: `[Action Required] ${stuckAccepted.length} accepted project(s) awaiting kickoff`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #fff;">Projects Awaiting Kickoff</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #a0a0b8; margin: 0 0 16px;">The following projects have been in <strong style="color: #fbbf24;">Accepted</strong> status for over 48 hours without moving to planning or in-progress:</p>
            <div style="background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); border-radius: 10px; padding: 16px; margin-bottom: 24px; line-height: 2;">
              ${list}
            </div>
            <div style="text-align: center;">
              <a href="${BASE_URL}/admin" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1, #06b6d4); color: #fff; text-decoration: none; border-radius: 999px; font-weight: 600;">
                Open Admin Panel →
              </a>
            </div>
          </div>
          <div style="padding: 24px 32px; border-top: 1px solid rgba(251,191,36,0.15); text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #6c6c85;">HydraBytes automated reminder · ${now.toDateString()}</p>
          </div>
        </div>`,
    }).catch((err) => console.error('[cron] stuck-accepted email error:', err));

    reminders.push(`stuck_accepted: ${stuckAccepted.length}`);
  }

  // ── 2. In-progress projects past their end date ───────────────────────────
  const overdue = await prisma.project.findMany({
    where: {
      status: { in: ['in_progress', 'review', 'planning'] },
      endDate: { lt: now },
    },
    include: { user: { select: { name: true, email: true } } },
  });

  if (overdue.length > 0) {
    const list = overdue.map(p => {
      const daysOver = Math.floor((now.getTime() - (p.endDate?.getTime() ?? 0)) / (24 * 60 * 60 * 1000));
      return `• ${escapeHtml(p.title)} — <strong style="color: #ef4444;">${daysOver}d overdue</strong> — ${escapeHtml(p.user?.name ?? 'Unknown')}`;
    }).join('<br/>');

    await sendEmail({
      to: TEAM_EMAIL,
      subject: `[Overdue] ${overdue.length} project(s) past their end date`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #fff;">Overdue Projects</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #a0a0b8; margin: 0 0 16px;">The following projects have passed their scheduled end date:</p>
            <div style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 16px; margin-bottom: 24px; line-height: 2;">
              ${list}
            </div>
            <div style="text-align: center;">
              <a href="${BASE_URL}/admin" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1, #06b6d4); color: #fff; text-decoration: none; border-radius: 999px; font-weight: 600;">
                Open Admin Panel →
              </a>
            </div>
          </div>
          <div style="padding: 24px 32px; border-top: 1px solid rgba(239,68,68,0.15); text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #6c6c85;">HydraBytes automated reminder · ${now.toDateString()}</p>
          </div>
        </div>`,
    }).catch((err) => console.error('[cron] overdue email error:', err));

    reminders.push(`overdue: ${overdue.length}`);
  }

  // ── 3. Invoices due in the next 3 days — advance reminder to client ─────────
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcomingInvoices = await prisma.invoice.findMany({
    where: {
      status: 'pending',
      dueDate: { gte: now, lte: threeDaysFromNow },
    },
    include: {
      user: { select: { name: true, email: true } },
      project: { select: { title: true } },
    },
  });

  for (const invoice of upcomingInvoices) {
    if (!invoice.user?.email) continue;

    const daysLeft = Math.ceil(((invoice.dueDate?.getTime() ?? 0) - now.getTime()) / (24 * 60 * 60 * 1000));
    const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount);
    const safeClientName = escapeHtml(invoice.user.name ?? 'there');
    const safeProjectTitle = escapeHtml(invoice.project?.title ?? 'General Services');

    await sendEmail({
      to: invoice.user.email,
      subject: `Invoice due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — ${formattedAmount}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #fff;">Invoice Due Soon</h1>
          </div>
          <div style="padding: 40px 32px;">
            <p style="font-size: 16px; color: #a0a0b8; margin: 0 0 16px;">Hi ${safeClientName},</p>
            <p style="font-size: 15px; line-height: 1.7; color: #a0a0b8; margin: 0 0 24px;">
              Just a heads-up — your invoice for <strong style="color: #f0f0f5;">${safeProjectTitle}</strong> is due in <strong style="color: #00e5ff;">${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>.
            </p>
            <div style="background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 10px; padding: 20px; margin-bottom: 32px; text-align: center;">
              <div style="font-size: 32px; font-weight: 800; color: #818cf8;">${formattedAmount}</div>
              <div style="font-size: 13px; color: #a0a0b8; margin-top: 4px;">Amount due</div>
            </div>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${BASE_URL}/payment/local/${invoice.id}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed, #00e5ff); color: #fff; text-decoration: none; border-radius: 999px; font-weight: 700; font-size: 15px;">
                Pay Now →
              </a>
            </div>
            <p style="font-size: 13px; color: #6c6c85; text-align: center;">
              Questions? <a href="${WA_LINK}" style="color: #25d366; text-decoration: none;">WhatsApp us</a>
            </p>
          </div>
          <div style="padding: 24px 32px; border-top: 1px solid rgba(124,58,237,0.15); text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #6c6c85;">© ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
          </div>
        </div>`,
    }).catch((err) => console.error('[cron] upcoming-invoice email error:', err));
  }

  if (upcomingInvoices.length > 0) {
    reminders.push(`upcoming_invoices: ${upcomingInvoices.length}`);
  }

  // ── 4. Completed projects with unpaid invoices past due date ──────────────
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: 'pending',
      dueDate: { lt: now },
    },
    include: {
      user: { select: { name: true, email: true } },
      project: { select: { title: true } },
    },
  });

  for (const invoice of overdueInvoices) {
    if (!invoice.user?.email) continue;

    const daysOver = Math.floor((now.getTime() - (invoice.dueDate?.getTime() ?? 0)) / (24 * 60 * 60 * 1000));
    const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount);
    const safeClientName = escapeHtml(invoice.user.name ?? 'there');
    const safeProjectTitle = escapeHtml(invoice.project?.title ?? 'General Services');

    await sendEmail({
      to: invoice.user.email,
      subject: `Payment reminder — ${formattedAmount} overdue for ${invoice.project?.title ?? 'your project'}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #fff;">Payment Reminder</h1>
          </div>
          <div style="padding: 40px 32px;">
            <p style="font-size: 16px; color: #a0a0b8; margin: 0 0 16px;">Hi ${safeClientName},</p>
            <p style="font-size: 15px; line-height: 1.7; color: #a0a0b8; margin: 0 0 24px;">
              A friendly reminder that your invoice for <strong style="color: #f0f0f5;">${safeProjectTitle}</strong> is now <strong style="color: #fbbf24;">${daysOver} day${daysOver !== 1 ? 's' : ''} overdue</strong>.
            </p>
            <div style="background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); border-radius: 10px; padding: 20px; margin-bottom: 32px; text-align: center;">
              <div style="font-size: 32px; font-weight: 800; color: #fbbf24;">${formattedAmount}</div>
              <div style="font-size: 13px; color: #a0a0b8; margin-top: 4px;">Amount due</div>
            </div>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${BASE_URL}/payment/local/${invoice.id}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; text-decoration: none; border-radius: 999px; font-weight: 700; font-size: 15px;">
                Pay Now →
              </a>
            </div>
            <p style="font-size: 13px; color: #6c6c85; text-align: center;">
              Questions? <a href="${WA_LINK}" style="color: #25d366; text-decoration: none;">WhatsApp us</a> and we'll sort it out.
            </p>
          </div>
          <div style="padding: 24px 32px; border-top: 1px solid rgba(251,191,36,0.15); text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #6c6c85;">© ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
          </div>
        </div>`,
    }).catch((err) => console.error('[cron] overdue-invoice email error:', err));
  }

  if (overdueInvoices.length > 0) {
    reminders.push(`overdue_invoices: ${overdueInvoices.length}`);
  }

  return NextResponse.json({
    ok: true,
    ran_at: now.toISOString(),
    reminders: reminders.length > 0 ? reminders : ['none'],
  });
}
