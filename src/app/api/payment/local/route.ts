import { NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.TEAM_EMAIL ?? 'hydrabytes4@gmail.com';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { invoiceId, method, transactionRef } = await req.json();

  if (!invoiceId || !method || !transactionRef?.trim()) {
    return NextResponse.json({ error: 'Invoice ID, payment method, and transaction reference are required.' }, { status: 400 });
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
      paymentRef: transactionRef.trim(),
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
  };

  // Notify admin
  await resend.emails.send({
    from: 'HydraBytes <onboarding@resend.dev>',
    to: ADMIN_EMAIL,
    subject: `💰 Payment Submitted — ${formattedAmount} via ${methodLabels[method] ?? method}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #fff;">Payment Submitted for Verification</h1>
        </div>
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px;">Client</td><td style="padding: 8px 0; color: #f0f0f5; font-weight: 600; text-align: right;">${invoice.user.name ?? 'N/A'} (${invoice.user.email})</td></tr>
            <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Project</td><td style="padding: 8px 0; color: #f0f0f5; font-weight: 600; text-align: right; border-top: 1px solid rgba(124,58,237,0.15);">${invoice.project?.title ?? 'General Services'}</td></tr>
            <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Amount</td><td style="padding: 8px 0; color: #22c55e; font-size: 20px; font-weight: 800; text-align: right; border-top: 1px solid rgba(124,58,237,0.15);">${formattedAmount}</td></tr>
            <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Method</td><td style="padding: 8px 0; color: #f0f0f5; font-weight: 600; text-align: right; border-top: 1px solid rgba(124,58,237,0.15);">${methodLabels[method] ?? method}</td></tr>
            <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Transaction Ref</td><td style="padding: 8px 0; color: #00e5ff; font-weight: 700; text-align: right; border-top: 1px solid rgba(124,58,237,0.15); font-family: monospace; font-size: 16px;">${transactionRef}</td></tr>
          </table>
          <div style="margin-top: 28px; text-align: center;">
            <a href="${process.env.AUTH_URL ?? 'https://hydrabytes.it.com'}/admin" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #7c3aed, #00e5ff); color: #fff; text-decoration: none; border-radius: 999px; font-weight: 600;">
              Verify &amp; Mark as Paid →
            </a>
          </div>
        </div>
      </div>
    `,
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
