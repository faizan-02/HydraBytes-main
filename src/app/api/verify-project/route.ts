import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const CALENDLY_LINK = 'https://calendly.com/faizanjawad02/30min';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const action = req.nextUrl.searchParams.get('action') ?? 'accept';
  const reason = req.nextUrl.searchParams.get('reason') ?? '';

  if (!token) {
    return new NextResponse(page('Invalid Link', 'No verification token provided.', 'error'), {
      headers: { 'Content-Type': 'text/html' }, status: 400,
    });
  }

  const project = await prisma.project.findUnique({
    where: { verifyToken: token },
    include: { user: { select: { email: true, name: true } } },
  });

  if (!project) {
    return new NextResponse(page('Invalid or Expired', 'This link is invalid or has already been used.', 'error'), {
      headers: { 'Content-Type': 'text/html' }, status: 404,
    });
  }

  if (['accepted', 'declined'].includes(project.status)) {
    return new NextResponse(page('Already Processed', `This project was already ${project.status}.`, 'info'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Show decline form if action=decline and no reason yet
  if (action === 'decline' && !reason) {
    return new NextResponse(declineForm(token, project.title), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  if (action === 'decline') {
    await prisma.project.update({
      where: { id: project.id },
      data: { status: 'declined', verifyToken: null },
    });

    // Notify client of decline
    if (project.user?.email) {
      await resend.emails.send({
        from: 'HydraBytes <onboarding@resend.dev>',
        to: project.user.email,
        subject: 'Update on your HydraBytes project inquiry',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#6366f1;">Project Update</h2>
            <p style="color:#374151;">Hi ${project.user.name ?? 'there'},</p>
            <p style="color:#374151;line-height:1.6;">Thank you for reaching out about <strong>${project.title}</strong>. After reviewing your inquiry, we're unable to take on this project at this time.</p>
            ${reason ? `<div style="margin:20px 0;padding:16px;background:#fef2f2;border-radius:8px;border-left:4px solid #ef4444;"><p style="margin:0;color:#991b1b;font-size:14px;"><strong>Reason:</strong> ${reason}</p></div>` : ''}
            <p style="color:#374151;line-height:1.6;">We encourage you to resubmit with updated requirements or reach out to us directly:</p>
            <div style="margin:20px 0;display:flex;gap:12px;">
              <a href="https://hydrabytes.it.com/contact" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-right:12px;">Resubmit Request</a>
              <a href="https://wa.me/923239999000" style="display:inline-block;padding:10px 20px;background:#25d366;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">WhatsApp Us</a>
            </div>
            <p style="color:#374151;">Best regards,<br/><strong>The HydraBytes Team</strong></p>
          </div>`,
      });
    }

    return new NextResponse(page('Project Declined', `"${project.title}" has been declined and the client has been notified.`, 'error'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Accept
  await prisma.project.update({
    where: { id: project.id },
    data: { status: 'accepted', verifyToken: null },
  });

  // Send acceptance email to client
  if (project.user?.email) {
    await resend.emails.send({
      from: 'HydraBytes <onboarding@resend.dev>',
      to: project.user.email,
      subject: '🎉 Your project has been accepted — HydraBytes',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#6366f1;">Great News, ${project.user.name ?? 'there'}! 🎉</h2>
          <p style="color:#374151;line-height:1.6;">Your project inquiry for <strong>${project.title}</strong> has been reviewed and accepted by our team!</p>
          <div style="margin:24px 0;padding:20px;background:#f0fdf4;border-radius:12px;border-left:4px solid #4ade80;">
            <p style="margin:0 0 8px;font-weight:600;color:#166534;">What happens next?</p>
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">Our team will reach out within <strong>24 hours</strong> via WhatsApp or email to discuss your project scope, timeline, and pricing in detail.</p>
          </div>
          <p style="color:#374151;line-height:1.6;">Want to discuss sooner? You can:</p>
          <div style="margin:20px 0;">
            <a href="${CALENDLY_LINK}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#6366f1,#06b6d4);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-right:12px;">📅 Book a Free Consultation</a>
            <a href="https://wa.me/923239999000" style="display:inline-block;padding:12px 24px;background:#25d366;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-top:8px;">💬 WhatsApp Us</a>
          </div>
          <p style="color:#374151;">Best regards,<br/><strong>The HydraBytes Team</strong></p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
          <p style="font-size:12px;color:#9ca3af;">HydraBytes · hydrabytes4@gmail.com · +92 323 9999 000</p>
        </div>`,
    });
  }

  return new NextResponse(page('Project Accepted! ✅', `"${project.title}" has been accepted and the client has been notified with next steps.`, 'success'), {
    headers: { 'Content-Type': 'text/html' },
  });
}

function declineForm(token: string, title: string) {
  return `<!DOCTYPE html>
<html>
<head><title>Decline Project — HydraBytes</title>
<style>
  body{font-family:sans-serif;background:#0a0a0f;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
  .card{background:#1e293b;border:1px solid rgba(239,68,68,0.3);border-radius:16px;padding:40px;max-width:480px;width:90%;}
  h1{color:#ef4444;margin:0 0 8px;}
  p{color:#94a3b8;margin:0 0 20px;}
  textarea{width:100%;padding:12px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#e2e8f0;font-size:14px;resize:vertical;box-sizing:border-box;}
  .btn-decline{display:block;width:100%;padding:12px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-weight:600;font-size:15px;cursor:pointer;margin-top:16px;}
  .btn-cancel{display:block;text-align:center;margin-top:12px;color:#94a3b8;text-decoration:none;font-size:14px;}
</style></head>
<body>
<div class="card">
  <div style="font-size:40px;margin-bottom:16px">❌</div>
  <h1>Decline Project</h1>
  <p>You are declining: <strong style="color:#e2e8f0">${title}</strong></p>
  <form method="GET" action="/api/verify-project">
    <input type="hidden" name="token" value="${token}"/>
    <input type="hidden" name="action" value="decline"/>
    <label style="font-size:13px;color:#94a3b8;display:block;margin-bottom:8px;">Reason for declining (optional — will be sent to client):</label>
    <textarea name="reason" rows="4" placeholder="e.g. Outside our current service scope, budget mismatch..."></textarea>
    <button type="submit" class="btn-decline">Confirm Decline</button>
  </form>
  <a href="https://hydrabytes.it.com" class="btn-cancel">Cancel</a>
</div>
</body></html>`;
}

function page(title: string, message: string, type: 'success' | 'error' | 'info') {
  const colors = { success: '#4ade80', error: '#ef4444', info: '#6366f1' };
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
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
  <a href="https://hydrabytes.it.com">Go to HydraBytes</a>
</div></body></html>`;
}
