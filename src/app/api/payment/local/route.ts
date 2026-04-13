import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mailer';
import { enforceRateLimit, FIFTEEN_MINUTES } from '@/lib/rateLimit';
import { readJsonBody, requireJson, escapeHtml, LIMITS } from '@/lib/validate';

const ADMIN_EMAIL = process.env.TEAM_EMAIL ?? 'contact@hydrabytes.tech';
const BASE_URL = process.env.AUTH_URL ?? 'https://www.hydrabytes.tech';
const ALLOWED_METHODS = new Set(['easypaisa', 'jazzcash', 'nayapay', 'bank', 'payoneer', 'usdt_trc20']);

// ─── USDT TRC20 auto-verification via TronScan public API ────────────────────
const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT on TRON mainnet
const USDT_DECIMALS = 6;
const TRON_WALLET = process.env.USDT_TRC20_WALLET ?? 'TMwcAY6Qi23Crsm4YEuVpS2BKTmWaMNMgr';

async function verifyUSDTPayment(txhash: string, expectedUSD: number): Promise<boolean> {
  // TRON tx hashes are exactly 64 hex characters
  if (!/^[0-9a-fA-F]{64}$/.test(txhash)) return false;
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(
      `https://apilist.tronscanapi.com/api/transaction-info?hash=${encodeURIComponent(txhash)}`,
      { signal: ctrl.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) return false;
    const data = await res.json() as {
      confirmed?: boolean;
      trc20TransferInfo?: Array<{
        contract_address?: string;
        to_address?: string;
        amount_str?: string;
      }>;
    };
    if (!data.confirmed) return false;
    const transfer = data.trc20TransferInfo?.find(
      t => t.contract_address === USDT_CONTRACT && t.to_address === TRON_WALLET
    );
    if (!transfer?.amount_str) return false;
    const sentAmount = Number(transfer.amount_str) / Math.pow(10, USDT_DECIMALS);
    return sentAmount >= expectedUSD * 0.99; // 1% tolerance for rounding
  } catch {
    return false; // network error → fall back to manual review
  }
}

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, 'payment:local', 10, FIFTEEN_MINUTES);
  if (limited) return limited;

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

  // Auto-verify USDT TRC20 via TronScan — skip manual review if confirmed on-chain
  let autoVerified = false;
  if (method === 'usdt_trc20') {
    autoVerified = await verifyUSDTPayment(trimmedRef, invoice.amount);
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paymentRef: trimmedRef,
      paymentMethod: method,
      status: autoVerified ? 'paid' : 'under_review',
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

  // If auto-verified: send payment confirmed email to client, no admin action needed
  if (autoVerified) {
    const userName = escapeHtml(invoice.user.name ?? 'there');
    const safeProjectTitle = escapeHtml(invoice.project?.title ?? 'General Services');
    await sendEmail({
      to: invoice.user.email,
      subject: `Payment Confirmed — ${formattedAmount} received`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">Payment Confirmed ✓</h1>
          </div>
          <div style="padding: 40px 32px;">
            <p style="font-size: 16px; color: #a0a0b8; margin: 0 0 16px;">Hi ${userName},</p>
            <p style="font-size: 16px; line-height: 1.7; color: #a0a0b8; margin: 0 0 24px;">
              Your USDT payment has been verified on-chain and your invoice is now marked as paid. Thank you!
            </p>
            <div style="background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); border-radius: 10px; padding: 24px; margin-bottom: 32px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px;">Project</td><td style="padding: 8px 0; color: #f0f0f5; font-size: 14px; font-weight: 600; text-align: right;">${safeProjectTitle}</td></tr>
                <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(34,197,94,0.15);">Amount Paid</td><td style="padding: 8px 0; color: #22c55e; font-size: 20px; font-weight: 800; text-align: right; border-top: 1px solid rgba(34,197,94,0.15);">${formattedAmount}</td></tr>
                <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(34,197,94,0.15);">Method</td><td style="padding: 8px 0; color: #f0f0f5; font-weight: 600; text-align: right; border-top: 1px solid rgba(34,197,94,0.15);">USDT (TRC20)</td></tr>
                <tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(34,197,94,0.15);">Status</td><td style="padding: 8px 0; text-align: right; border-top: 1px solid rgba(34,197,94,0.15);"><span style="padding: 4px 12px; background: rgba(34,197,94,0.1); color: #22c55e; border-radius: 999px; font-size: 13px; font-weight: 600;">Paid</span></td></tr>
              </table>
            </div>
            <div style="text-align: center;">
              <a href="${BASE_URL}/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px;">View Dashboard</a>
            </div>
          </div>
          <div style="padding: 24px 32px; border-top: 1px solid rgba(34,197,94,0.15); text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #6c6c85;">© ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
          </div>
        </div>`,
    }).catch((err) => { console.error('[payment/local] auto-verify confirm email error:', err); });

    return NextResponse.json({ success: true, verified: true });
  }

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
            <a href="${process.env.AUTH_URL ?? 'https://hydrabytes.tech'}/admin" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #7c3aed, #00e5ff); color: #fff; text-decoration: none; border-radius: 999px; font-weight: 600;">
              Verify &amp; Mark as Paid →
            </a>
          </div>
        </div>
      </div>
    `,
  }).catch((err) => { console.error('[payment/local] admin notification email error:', err); });

  return NextResponse.json({ success: true });
}
