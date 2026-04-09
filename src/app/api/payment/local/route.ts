import { NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mailer';
import { readJsonBody, requireJson, escapeHtml, LIMITS } from '@/lib/validate';
const ADMIN_EMAIL = process.env.TEAM_EMAIL ?? 'hydrabytes4@gmail.com';

const ALLOWED_METHODS = new Set(['easypaisa', 'jazzcash', 'nayapay', 'bank', 'payoneer', 'usdt_trc20']);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ctGuard = requireJson(req);
  if (ctGuard) return ctGuard;
  const parsed = await readJsonBody<{ invoiceId?: unknown; method?: unknown; transactionRef?: unknown }>(req);
  if (!parsed.ok) return parsed.response;
  const { invoiceId, method, transactionRef } = parsed.data;

  if (typeof invoiceId !== 'string' || invoiceId.length === 0 || invoiceId.length > 128) {
    return NextResponse.json({ error: 'Invalid invoice id.' }, { status: 400 });
  }
  if (typeof method !== 'string' || !ALLOWED_METHODS.has(method)) {
    return NextResponse.json({ error: 'Invalid payment method.' }, { status: 400 });
  }
  if (typeof transactionRef !== 'string') {
    return NextResponse.json({ error: 'Transaction reference is required.' }, { status: 400 });
  }
  const trimmedRef = transactionRef.trim();
  if (trimmedRef.length === 0 || trimmedRef.length > LIMITS.TRANSACTION_REF_MAX) {
    return NextResponse.json({ error: 'Invalid transaction reference.' }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      user: { select: { name: true, email: true } },
      project: { select: { title: true } },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
  }

  if (invoice.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  if (invoice.status === 'paid') {
    return NextResponse.json({ error: 'Invoice already paid.' }, { status: 400 });
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paymentRef: trimmedRef,
      paymentMethod: method,
      status: 'under_review',
    },
  });

  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount);
  const methodLabels: Record<string, string> = {
    easypaisa: 'Easypaisa',
    jazzcash: 'JazzCash',
    nayapay: 'NayaPay',
    bank: 'Bank Transfer',
    payoneer: 'Payoneer',
    usdt_trc20: 'USDT (TRC20)',
  };

  // Notify admin
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Payment Submitted — ${formattedAmount} via ${methodLabels[method] ?? method}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #fff;">Payment Submitted for Verification</h1>
        </div>
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px;">Client</td><td style="padding: 8px 0; color: #f0f0f5; font-weight: 600; text-align: right;">${escapeHtml(invoice.user.name ?? 'N/A')} (${escapeHtml(invoice.user.email)})</td></tr>
            <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Project</td><td style="padding: 8px 0; color: #f0f0f5; font-weight: 600; text-align: right; border-top: 1px solid rgba(124,58,237,0.15);">${escapeHtml(invoice.project?.title ?? 'General Services')}</td></tr>
            <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Amount</td><td style="padding: 8px 0; color: #22c55e; font-size: 20px; font-weight: 800; text-align: right; border-top: 1px solid rgba(124,58,237,0.15);">${formattedAmount}</td></tr>
            <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Method</td><td style="padding: 8px 0; color: #f0f0f5; font-weight: 600; text-align: right; border-top: 1px solid rgba(124,58,237,0.15);">${escapeHtml(methodLabels[method] ?? method)}</td></tr>
            <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Transaction Ref</td><td style="padding: 8px 0; color: #00e5ff; font-weight: 700; text-align: right; border-top: 1px solid rgba(124,58,237,0.15); font-family: monospace; font-size: 16px;">${escapeHtml(trimmedRef)}</td></tr>
          </table>
          <div style="margin-top: 28px; text-align: center;">
            <a href="${process.env.AUTH_URL ?? 'https://hydrabytes.it.com'}/admin" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #7c3aed, #00e5ff); color: #fff; text-decoration: none; border-radius: 999px; font-weight: 600;">
              Verify &amp; Mark as Paid →
            </a>
          </div>
        </div>
      </div>
    `,
  }).catch((err) => { console.error('[payment/local] admin notification email error:', err); });

  return NextResponse.json({ success: true });
}
