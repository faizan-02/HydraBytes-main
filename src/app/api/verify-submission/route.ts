import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mailer';
import crypto from 'crypto';
import { escapeHtml } from '@/lib/validate';
import { enforceRateLimit, FIFTEEN_MINUTES } from '@/lib/rateLimit';

const BASE_URL = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://www.hydrabytes.tech';
const CALENDLY_LINK = process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/faizanjawad02/30min';
const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP ?? '923239999000'}`;

export async function GET(req: NextRequest) {
  const limited = enforceRateLimit(req, 'verify-submission', 15, FIFTEEN_MINUTES);
  if (limited) return limited;

  const id = req.nextUrl.searchParams.get('id');
  const token = req.nextUrl.searchParams.get('token');
  const action = req.nextUrl.searchParams.get('action') ?? 'accept';
  const reason = req.nextUrl.searchParams.get('reason') ?? '';

  if (!id || !token) {
    return html(page('Invalid Link', 'Missing parameters.', 'error'), 400);
  }

  // Hard caps to defend against pathological inputs in HMAC / DB lookup
  if (id.length > 128 || token.length > 256 || !/^[A-Za-z0-9_-]+$/.test(id) || !/^[A-Fa-f0-9]+$/.test(token)) {
    return html(page('Invalid Link', 'This link is malformed.', 'error'), 400);
  }

  // Verify HMAC token. Refuse to operate without a configured secret —
  // a hardcoded fallback would let an attacker forge any link.
  const hmacSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!hmacSecret) {
    console.error('[verify-submission] AUTH_SECRET / NEXTAUTH_SECRET is not configured');
    return html(page('Server Error', 'Server is misconfigured.', 'error'), 500);
  }
  const expected = crypto.createHmac('sha256', hmacSecret).update(id).digest('hex');
  // Constant-time comparison to mitigate timing attacks
  const expectedBuf = Buffer.from(expected, 'hex');
  let tokenBuf: Buffer;
  try {
    tokenBuf = Buffer.from(token, 'hex');
  } catch {
    return html(page('Invalid Link', 'This link is invalid.', 'error'), 400);
  }
  if (
    expectedBuf.length !== tokenBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, tokenBuf)
  ) {
    return html(page('Invalid Link', 'This link is invalid or has been tampered with.', 'error'), 400);
  }

  const submission = await prisma.contactSubmission.findUnique({ where: { id } });

  if (!submission) {
    return html(page('Not Found', 'This inquiry could not be found.', 'error'), 404);
  }

  if (['contacted', 'closed'].includes(submission.status)) {
    return html(page('Already Processed', `This inquiry was already ${submission.status === 'contacted' ? 'accepted' : 'declined'}.`, 'info'));
  }

  const safeSubmissionName = escapeHtml(submission.name);
  const safeSubmissionService = escapeHtml(submission.service);
  const safeSubmissionEmail = escapeHtml(submission.email);

  // Show decline form
  if (action === 'decline' && !reason) {
    return html(declineForm(id, token, submission.name, submission.service));
  }

  if (action === 'decline') {
    await prisma.contactSubmission.update({ where: { id }, data: { status: 'closed' } });

    // Cap reason length defensively then escape for HTML
    const safeReason = reason ? escapeHtml(reason.slice(0, 1000)) : '';

    await sendEmail({
      to: submission.email,
      subject: 'Update on your HydraBytes inquiry',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0a12;color:#f0f0f5;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#374151,#1f2937);padding:40px 32px;text-align:center;">
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">Inquiry Update</h1>
          </div>
          <div style="padding:40px 32px;">
            <p style="font-size:16px;color:#a0a0b8;margin:0 0 16px;">Hi ${safeSubmissionName},</p>
            <p style="font-size:15px;line-height:1.7;color:#a0a0b8;margin:0 0 24px;">
              Thank you for your interest in <strong style="color:#f0f0f5">${safeSubmissionService}</strong>. After reviewing your inquiry, we're unable to take on this project at this time.
            </p>
            ${safeReason ? `<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:16px;margin-bottom:24px;"><p style="margin:0;font-size:14px;color:#fca5a5;"><strong>Reason:</strong> ${safeReason}</p></div>` : ''}
            <p style="font-size:15px;line-height:1.7;color:#a0a0b8;margin:0 0 24px;">We encourage you to resubmit with updated requirements, or reach out to us directly to explore what we can help with.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <a href="${BASE_URL}/contact" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#1a6b7a,#00b4d8);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Submit New Request</a>
              <a href="${WA_LINK}" style="display:inline-block;padding:12px 24px;background:#25d366;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">WhatsApp Us</a>
            </div>
          </div>
          <div style="padding:24px 32px;border-top:1px solid rgba(0,180,216,0.15);text-align:center;">
            <p style="margin:0;font-size:13px;color:#6c6c85;">© ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
          </div>
        </div>`,
    }).catch((err) => { console.error('[verify-submission] decline email error:', err); });

    return html(page('Inquiry Declined', `${safeSubmissionName}'s inquiry has been declined and they have been notified.`, 'error'));
  }

  // Accept — update status
  await prisma.contactSubmission.update({ where: { id }, data: { status: 'contacted' } });

  // If user already registered with this email, create the project immediately
  const existingUser = await prisma.user.findUnique({
    where: { email: submission.email },
  });

  if (existingUser) {
    await prisma.project.create({
      data: {
        userId: existingUser.id,
        title: `${submission.service} Project`,
        service: submission.service,
        budget: submission.budget,
        description: submission.message,
        status: 'accepted',
      },
    });
  }

  const dashboardUrl = `${BASE_URL}/dashboard`;
  const registerUrl = `${BASE_URL}/auth/register?email=${encodeURIComponent(submission.email)}`;
  const ctaUrl = existingUser ? dashboardUrl : registerUrl;
  const ctaText = existingUser ? 'View Your Dashboard →' : 'Create Your Free Account →';
  const ctaDesc = existingUser
    ? `Your project has been added to your dashboard.`
    : `Create your free HydraBytes account using the email address you submitted your inquiry with (<strong style="color:#c4b5fd">${safeSubmissionEmail}</strong>) to:`;

  await sendEmail({
    to: submission.email,
    subject: 'Your HydraBytes inquiry has been accepted!',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0a12;color:#f0f0f5;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1a6b7a 0%,#00b4d8 100%);padding:40px 32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff;">Great News!</h1>
          <p style="margin:8px 0 0;font-size:16px;color:rgba(255,255,255,0.85);">Your inquiry has been accepted</p>
        </div>
        <div style="padding:40px 32px;">
          <p style="font-size:16px;color:#a0a0b8;margin:0 0 16px;">Hi ${safeSubmissionName},</p>
          <p style="font-size:15px;line-height:1.7;color:#a0a0b8;margin:0 0 24px;">
            We've reviewed your inquiry for <strong style="color:#f0f0f5">${safeSubmissionService}</strong> and we're excited to work with you! Our team will reach out within <strong style="color:#f0f0f5">24 hours</strong> to discuss scope, timeline, and next steps.
          </p>

          <div style="background:rgba(0,180,216,0.08);border:1px solid rgba(0,180,216,0.25);border-radius:12px;padding:24px;margin-bottom:32px;">
            <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#f0f0f5;">Track your project in real-time</p>
            <p style="margin:0 0 16px;font-size:14px;color:#a0a0b8;line-height:1.6;">${ctaDesc}</p>
            ${!existingUser ? `<ul style="margin:0 0 20px;padding-left:20px;color:#a0a0b8;font-size:14px;line-height:1.8;">
              <li>See your project status update in real-time</li>
              <li>Receive and pay invoices directly</li>
              <li>Book consultations and contact your developer</li>
              <li>Get notified at every milestone</li>
            </ul>` : ''}
            <a href="${ctaUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#1a6b7a,#00b4d8);color:#fff;text-decoration:none;border-radius:999px;font-weight:700;font-size:15px;">
              ${ctaText}
            </a>
          </div>

          <p style="font-size:14px;color:#6c6c85;margin:0 0 20px;">Want to connect sooner?</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a href="${CALENDLY_LINK}" style="display:inline-block;padding:11px 22px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#a5b4fc;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Book a Free Call</a>
            <a href="${WA_LINK}" style="display:inline-block;padding:11px 22px;background:#25d366;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">WhatsApp Us</a>
          </div>
        </div>
        <div style="padding:24px 32px;border-top:1px solid rgba(0,180,216,0.15);text-align:center;">
          <p style="margin:0;font-size:13px;color:#6c6c85;">© ${new Date().getFullYear()} HydraBytes · contact@hydrabytes.tech · +92 323 9999 000</p>
        </div>
      </div>`,
  }).catch((err) => { console.error('[verify-submission] accept email error:', err); });

  return html(page('Inquiry Accepted', `${safeSubmissionName} has been notified${existingUser ? ' and their project is live on their dashboard' : ' with an invitation to create their account and track progress'}.`, 'success'));
}

function html(content: string, status = 200) {
  return new NextResponse(content, { headers: { 'Content-Type': 'text/html' }, status });
}

function declineForm(id: string, token: string, name: string, service: string) {
  const safeId = escapeHtml(id);
  const safeToken = escapeHtml(token);
  const safeName = escapeHtml(name);
  const safeService = escapeHtml(service);
  return `<!DOCTYPE html>
<html>
<head><title>Decline Inquiry - HydraBytes</title>
<style>
  body{font-family:sans-serif;background:#0a0a0f;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
  .card{background:#1e293b;border:1px solid rgba(239,68,68,0.3);border-radius:16px;padding:40px;max-width:480px;width:90%;}
  h1{color:#ef4444;margin:0 0 8px;}
  p{color:#94a3b8;margin:0 0 20px;}
  textarea{width:100%;padding:12px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#e2e8f0;font-size:14px;resize:vertical;box-sizing:border-box;}
  .btn{display:block;width:100%;padding:12px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-weight:600;font-size:15px;cursor:pointer;margin-top:16px;}
  .cancel{display:block;text-align:center;margin-top:12px;color:#94a3b8;text-decoration:none;font-size:14px;}
</style></head>
<body>
<div class="card">
  <div style="font-size:40px;margin-bottom:16px;color:#ef4444;">&#10005;</div>
  <h1>Decline Inquiry</h1>
  <p>Declining: <strong style="color:#e2e8f0">${safeName}</strong>, ${safeService}</p>
  <form method="GET" action="/api/verify-submission">
    <input type="hidden" name="id" value="${safeId}"/>
    <input type="hidden" name="token" value="${safeToken}"/>
    <input type="hidden" name="action" value="decline"/>
    <label style="font-size:13px;color:#94a3b8;display:block;margin-bottom:8px;">Reason for declining (optional, will be sent to client):</label>
    <textarea name="reason" rows="4" placeholder="e.g. Outside our current service scope, budget mismatch..."></textarea>
    <button type="submit" class="btn">Confirm Decline</button>
  </form>
  <a href="https://www.hydrabytes.tech" class="cancel">Cancel</a>
</div>
</body></html>`;
}

function page(title: string, message: string, type: 'success' | 'error' | 'info') {
  const colors = { success: '#4ade80', error: '#ef4444', info: '#6366f1' };
  const icons = { success: '&#10003;', error: '&#10005;', info: 'i' };
  const color = colors[type];
  return `<!DOCTYPE html>
<html>
<head><title>${title} - HydraBytes</title>
<style>body{font-family:sans-serif;background:#0a0a0f;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.card{background:#1e293b;border:1px solid ${color}44;border-radius:16px;padding:40px;max-width:480px;text-align:center;}
h1{color:${color};margin:0 0 16px;}p{color:#94a3b8;line-height:1.6;margin:0 0 24px;}
a{display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#6366f1,#06b6d4);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;}
</style></head>
<body><div class="card">
  <div style="font-size:48px;margin-bottom:16px">${icons[type]}</div>
  <h1>${title}</h1><p>${message}</p>
  <a href="https://www.hydrabytes.tech">Go to HydraBytes</a>
</div></body></html>`;
}
