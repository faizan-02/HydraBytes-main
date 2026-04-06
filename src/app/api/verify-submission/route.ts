import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://www.hydrabytes.it.com';
const CALENDLY_LINK = process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/faizanjawad02/30min';
const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP ?? '923239999000'}`;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const token = req.nextUrl.searchParams.get('token');
  const action = req.nextUrl.searchParams.get('action') ?? 'accept';
  const reason = req.nextUrl.searchParams.get('reason') ?? '';

  if (!id || !token) {
    return html(page('Invalid Link', 'Missing parameters.', 'error'), 400);
  }

  // Verify HMAC token
  const hmacSecret = process.env.AUTH_SECRET ?? 'hydrabytes_fallback_secret';
  const expected = crypto.createHmac('sha256', hmacSecret).update(id).digest('hex');
  if (token !== expected) {
    return html(page('Invalid Link', 'This link is invalid or has been tampered with.', 'error'), 400);
  }

  const submission = await prisma.contactSubmission.findUnique({ where: { id } });

  if (!submission) {
    return html(page('Not Found', 'This inquiry could not be found.', 'error'), 404);
  }

  if (['contacted', 'closed'].includes(submission.status)) {
    return html(page('Already Processed', `This inquiry was already ${submission.status === 'contacted' ? 'accepted' : 'declined'}.`, 'info'));
  }

  // Show decline form
  if (action === 'decline' && !reason) {
    return html(declineForm(id, token, submission.name, submission.service));
  }

  if (action === 'decline') {
    await prisma.contactSubmission.update({ where: { id }, data: { status: 'closed' } });

    await resend.emails.send({
      from: 'HydraBytes <hello@hydrabytes.it.com>',
      to: submission.email,
      subject: 'Update on your HydraBytes inquiry',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0a12;color:#f0f0f5;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#374151,#1f2937);padding:40px 32px;text-align:center;">
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">Inquiry Update</h1>
          </div>
          <div style="padding:40px 32px;">
            <p style="font-size:16px;color:#a0a0b8;margin:0 0 16px;">Hi ${submission.name},</p>
            <p style="font-size:15px;line-height:1.7;color:#a0a0b8;margin:0 0 24px;">
              Thank you for your interest in <strong style="color:#f0f0f5">${submission.service}</strong>. After reviewing your inquiry, we're unable to take on this project at this time.
            </p>
            ${reason ? `<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:16px;margin-bottom:24px;"><p style="margin:0;font-size:14px;color:#fca5a5;"><strong>Reason:</strong> ${reason}</p></div>` : ''}
            <p style="font-size:15px;line-height:1.7;color:#a0a0b8;margin:0 0 24px;">We encourage you to resubmit with updated requirements, or reach out to us directly to explore what we can help with.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <a href="${BASE_URL}/contact" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#00e5ff);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Submit New Request</a>
              <a href="${WA_LINK}" style="display:inline-block;padding:12px 24px;background:#25d366;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">WhatsApp Us</a>
            </div>
          </div>
          <div style="padding:24px 32px;border-top:1px solid rgba(124,58,237,0.15);text-align:center;">
            <p style="margin:0;font-size:13px;color:#6c6c85;">© ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
          </div>
        </div>`,
    }).catch(() => {});

    return html(page('Inquiry Declined', `${submission.name}'s inquiry has been declined and they have been notified.`, 'error'));
  }

  // Accept — update status and send invite email
  await prisma.contactSubmission.update({ where: { id }, data: { status: 'contacted' } });

  const registerUrl = `${BASE_URL}/auth/register?email=${encodeURIComponent(submission.email)}`;

  await resend.emails.send({
    from: 'HydraBytes <hello@hydrabytes.it.com>',
    to: submission.email,
    subject: 'Your HydraBytes inquiry has been accepted!',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0a12;color:#f0f0f5;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#7c3aed 0%,#00e5ff 100%);padding:40px 32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff;">Great News!</h1>
          <p style="margin:8px 0 0;font-size:16px;color:rgba(255,255,255,0.85);">Your inquiry has been accepted</p>
        </div>
        <div style="padding:40px 32px;">
          <p style="font-size:16px;color:#a0a0b8;margin:0 0 16px;">Hi ${submission.name},</p>
          <p style="font-size:15px;line-height:1.7;color:#a0a0b8;margin:0 0 24px;">
            We've reviewed your inquiry for <strong style="color:#f0f0f5">${submission.service}</strong> and we're excited to work with you! Our team will reach out within <strong style="color:#f0f0f5">24 hours</strong> to discuss scope, timeline, and next steps.
          </p>

          <div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:12px;padding:24px;margin-bottom:32px;">
            <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#f0f0f5;">Track your project in real-time</p>
            <p style="margin:0 0 16px;font-size:14px;color:#a0a0b8;line-height:1.6;">Create your free HydraBytes account using the email address you submitted your inquiry with (<strong style="color:#c4b5fd">${submission.email}</strong>) to:</p>
            <ul style="margin:0 0 20px;padding-left:20px;color:#a0a0b8;font-size:14px;line-height:1.8;">
              <li>See your project status update in real-time</li>
              <li>Receive and pay invoices directly</li>
              <li>Book consultations and contact your developer</li>
              <li>Get notified at every milestone</li>
            </ul>
            <a href="${registerUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#00e5ff);color:#fff;text-decoration:none;border-radius:999px;font-weight:700;font-size:15px;">
              Create Your Free Account →
            </a>
          </div>

          <p style="font-size:14px;color:#6c6c85;margin:0 0 20px;">Want to connect sooner?</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a href="${CALENDLY_LINK}" style="display:inline-block;padding:11px 22px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#a5b4fc;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Book a Free Call</a>
            <a href="${WA_LINK}" style="display:inline-block;padding:11px 22px;background:#25d366;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">WhatsApp Us</a>
          </div>
        </div>
        <div style="padding:24px 32px;border-top:1px solid rgba(124,58,237,0.15);text-align:center;">
          <p style="margin:0;font-size:13px;color:#6c6c85;">© ${new Date().getFullYear()} HydraBytes · hydrabytes4@gmail.com · +92 323 9999 000</p>
        </div>
      </div>`,
  }).catch(() => {});

  return html(page('Inquiry Accepted', `${submission.name} has been notified with an invitation to create their account and track progress.`, 'success'));
}

function html(content: string, status = 200) {
  return new NextResponse(content, { headers: { 'Content-Type': 'text/html' }, status });
}

function declineForm(id: string, token: string, name: string, service: string) {
  return `<!DOCTYPE html>
<html>
<head><title>Decline Inquiry — HydraBytes</title>
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
  <p>Declining: <strong style="color:#e2e8f0">${name}</strong> — ${service}</p>
  <form method="GET" action="/api/verify-submission">
    <input type="hidden" name="id" value="${id}"/>
    <input type="hidden" name="token" value="${token}"/>
    <input type="hidden" name="action" value="decline"/>
    <label style="font-size:13px;color:#94a3b8;display:block;margin-bottom:8px;">Reason for declining (optional — will be sent to client):</label>
    <textarea name="reason" rows="4" placeholder="e.g. Outside our current service scope, budget mismatch..."></textarea>
    <button type="submit" class="btn">Confirm Decline</button>
  </form>
  <a href="https://www.hydrabytes.it.com" class="cancel">Cancel</a>
</div>
</body></html>`;
}

function page(title: string, message: string, type: 'success' | 'error' | 'info') {
  const colors = { success: '#4ade80', error: '#ef4444', info: '#6366f1' };
  const icons = { success: '&#10003;', error: '&#10005;', info: 'i' };
  const color = colors[type];
  return `<!DOCTYPE html>
<html>
<head><title>${title} — HydraBytes</title>
<style>body{font-family:sans-serif;background:#0a0a0f;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.card{background:#1e293b;border:1px solid ${color}44;border-radius:16px;padding:40px;max-width:480px;text-align:center;}
h1{color:${color};margin:0 0 16px;}p{color:#94a3b8;line-height:1.6;margin:0 0 24px;}
a{display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#6366f1,#06b6d4);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;}
</style></head>
<body><div class="card">
  <div style="font-size:48px;margin-bottom:16px">${icons[type]}</div>
  <h1>${title}</h1><p>${message}</p>
  <a href="https://www.hydrabytes.it.com">Go to HydraBytes</a>
</div></body></html>`;
}
