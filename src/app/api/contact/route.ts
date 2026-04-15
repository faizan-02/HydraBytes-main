import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';
import { prisma } from '@/lib/prisma';
import { auth } from '@/../auth';
import crypto from 'crypto';
import { enforceRateLimit, FIFTEEN_MINUTES } from '@/lib/rateLimit';
import {
  readJsonBody,
  requireJson,
  validateName,
  validateEmail,
  validateMessage,
  validateShortText,
  validateOptionalShortText,
  escapeHtml,
  LIMITS,
} from '@/lib/validate';
const TEAM_EMAIL = process.env.TEAM_EMAIL!;
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const SERVICE_LABELS: Record<string, string> = {
  'starter-website': 'Starter Website ($399)',
  'business-website': 'Business Website ($999)',
  'premium-web-app': 'Premium Web App ($2,500+)',
  'mvp-app': 'MVP App ($2,000)',
  'growth-app': 'Growth App ($5,000)',
  'scale-product': 'Scale Product ($10,000+)',
  'ai-chatbot': 'AI Chatbot ($300–$800)',
  'ai-automation': 'AI Automation ($1,000–$3,000)',
  'custom-ai-system': 'Custom AI System ($5,000+)',
  other: 'Other / Not Sure',
};

export async function POST(req: NextRequest) {
  // Modest rate limit on the contact form to mitigate abuse / spam
  const limited = enforceRateLimit(req, 'contact', 5, FIFTEEN_MINUTES);
  if (limited) return limited;

  const ctGuard = requireJson(req);
  if (ctGuard) return ctGuard;

  const parsed = await readJsonBody<{
    name?: unknown;
    email?: unknown;
    service?: unknown;
    budget?: unknown;
    message?: unknown;
  }>(req);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const nameRes = validateName(body.name);
  if ('error' in nameRes) return NextResponse.json({ error: nameRes.error }, { status: nameRes.status });
  const emailRes = validateEmail(body.email);
  if ('error' in emailRes) return NextResponse.json({ error: emailRes.error }, { status: emailRes.status });
  const serviceRes = validateShortText(body.service, 'Service', LIMITS.SERVICE_MAX);
  if ('error' in serviceRes) return NextResponse.json({ error: serviceRes.error }, { status: serviceRes.status });
  const messageRes = validateMessage(body.message);
  if ('error' in messageRes) return NextResponse.json({ error: messageRes.error }, { status: messageRes.status });
  const budgetRes = validateOptionalShortText(body.budget, 'Budget', LIMITS.BUDGET_MAX);
  if ('error' in budgetRes) return NextResponse.json({ error: budgetRes.error }, { status: budgetRes.status });

  const name = nameRes.value;
  const email = emailRes.value;
  const service = serviceRes.value;
  const message = messageRes.value;
  const budget = budgetRes.value;

  try {
    const serviceLabel = SERVICE_LABELS[service] || service;
    const budgetLabel = budget || 'Not specified';

    // Pre-escape user content for safe interpolation into HTML emails
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);
    const safeServiceLabel = escapeHtml(serviceLabel);
    const safeBudgetLabel = escapeHtml(budgetLabel);

    // Save contact submission FIRST so we have its ID for HMAC signing
    const submission = await prisma.contactSubmission.create({
      data: { name, email, budget: budgetLabel, service: serviceLabel, message, status: 'new' },
    });

    let projectId: string | null = null;
    let verifyToken: string | null = null;
    const sessionCheck = await auth();
    if (sessionCheck?.user?.id) {
      verifyToken = crypto.randomBytes(32).toString('hex');
      const project = await prisma.project.create({
        data: {
          userId: sessionCheck.user.id,
          title: `${serviceLabel} Project`,
          service: serviceLabel,
          budget: budgetLabel,
          description: message,
          status: 'pending_verification',
          verifyToken,
        },
      });
      projectId = project.id;
    }

    // For signed-in users: project accept/decline via verifyToken
    const verifySection = projectId && verifyToken ? `
      <div style="margin-top:24px;padding:20px;background:#0f172a;border-radius:10px;border:1px solid rgba(99,102,241,0.3);">
        <p style="margin:0 0 4px;font-weight:600;color:#a5b4fc;">Registered User Project</p>
        <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">Review this inquiry and accept or decline it. The client will be notified automatically.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <a href="${BASE_URL}/api/verify-project?token=${verifyToken}&action=accept"
             style="display:inline-block;padding:12px 24px;background:#4ade80;color:#0a0a0f;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
            Accept Project
          </a>
          <a href="${BASE_URL}/api/verify-project?token=${verifyToken}&action=decline"
             style="display:inline-block;padding:12px 24px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
            Decline Project
          </a>
        </div>
        <p style="margin:12px 0 0;font-size:12px;color:#64748b;">Project ID: ${projectId}</p>
      </div>` : '';

    // For guest users: submission accept/decline via HMAC-signed link (no account required)
    const hmacSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
    if (!hmacSecret) {
      console.error('[contact] AUTH_SECRET / NEXTAUTH_SECRET is not configured');
      return NextResponse.json({ error: 'Server is misconfigured.' }, { status: 500 });
    }
    const submissionHmac = crypto.createHmac('sha256', hmacSecret).update(submission.id).digest('hex');
    const guestVerifySection = !sessionCheck?.user?.id ? `
      <div style="margin-top:24px;padding:20px;background:#0f172a;border-radius:10px;border:1px solid rgba(251,191,36,0.3);">
        <p style="margin:0 0 4px;font-weight:600;color:#fbbf24;">Guest Inquiry</p>
        <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">Accept to send the client an invite to create their account and track progress. Decline to close the inquiry.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <a href="${BASE_URL}/api/verify-submission?id=${submission.id}&token=${submissionHmac}&action=accept"
             style="display:inline-block;padding:12px 24px;background:#4ade80;color:#0a0a0f;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
            Accept &amp; Invite
          </a>
          <a href="${BASE_URL}/api/verify-submission?id=${submission.id}&token=${submissionHmac}&action=decline"
             style="display:inline-block;padding:12px 24px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
            Decline
          </a>
        </div>
        <p style="margin:12px 0 0;font-size:12px;color:#64748b;">Submission ID: ${submission.id}</p>
      </div>` : '';

    // Notify team
    try {
      await sendEmail({
        to: TEAM_EMAIL,
        subject: `New Inquiry: ${name} - ${serviceLabel}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0f;color:#e2e8f0;">
            <h2 style="color:#6366f1;margin-bottom:24px;">New Contact Form Submission</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#94a3b8;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;">${safeName}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Email</td><td style="padding:8px 0;"><a href="mailto:${safeEmail}" style="color:#6366f1;">${safeEmail}</a></td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Service</td><td style="padding:8px 0;">${safeServiceLabel}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Budget</td><td style="padding:8px 0;">${safeBudgetLabel}</td></tr>
            </table>
            <div style="margin-top:20px;padding:16px;background:#1e293b;border-radius:8px;border-left:4px solid #6366f1;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">Message</p>
              <p style="margin:0;white-space:pre-wrap;">${safeMessage}</p>
            </div>
            ${verifySection}${guestVerifySection}
            <p style="margin-top:24px;font-size:12px;color:#475569;">Submitted via hydrabytes.tech</p>
          </div>`,
      });
    } catch (teamEmailError) {
      console.error('[contact] Team email error:', teamEmailError);
    }

    // Confirm to client
    try {
      await sendEmail({
        to: email,
        subject: 'We received your message — HydraBytes',
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0a12;color:#f0f0f5;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#7c3aed 0%,#00e5ff 100%);padding:40px 32px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">Thanks for reaching out!</h1>
              <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.85);">We'll get back to you within 24 hours</p>
            </div>
            <div style="padding:40px 32px;">
              <p style="font-size:16px;color:#a0a0b8;margin:0 0 20px;">Hi ${safeName},</p>
              <p style="font-size:15px;line-height:1.7;color:#a0a0b8;margin:0 0 28px;">
                We've received your inquiry about <strong style="color:#f0f0f5;">${safeServiceLabel}</strong> and our team is already reviewing it. Expect to hear from us shortly.
              </p>

              <!-- Inquiry Summary Card -->
              <div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:24px;margin-bottom:28px;">
                <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:1px;">Your Inquiry</p>
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:10px 0;color:#6c6c85;font-size:14px;border-bottom:1px solid rgba(124,58,237,0.12);">Service</td>
                    <td style="padding:10px 0;color:#f0f0f5;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid rgba(124,58,237,0.12);">${safeServiceLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#6c6c85;font-size:14px;">Budget</td>
                    <td style="padding:10px 0;color:#f0f0f5;font-size:14px;font-weight:600;text-align:right;">${safeBudgetLabel}</td>
                  </tr>
                </table>
              </div>

              ${projectId
                ? `<div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.25);border-radius:12px;padding:20px;margin-bottom:28px;text-align:center;">
                    <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#f0f0f5;">Your project is live!</p>
                    <p style="margin:0 0 16px;font-size:14px;color:#a0a0b8;">Track real-time progress, receive invoices, and communicate with your developer.</p>
                    <a href="${BASE_URL}/dashboard" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#00e5ff);color:#fff;text-decoration:none;border-radius:999px;font-weight:700;font-size:15px;">View Dashboard →</a>
                  </div>`
                : `<div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:12px;padding:24px;margin-bottom:28px;">
                    <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#f0f0f5;">Want to track your inquiry?</p>
                    <p style="margin:0 0 16px;font-size:14px;color:#a0a0b8;line-height:1.6;">Create a free account to see real-time updates, receive project notifications, and manage invoices.</p>
                    <a href="${BASE_URL}/auth/register?email=${encodeURIComponent(email)}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#00e5ff);color:#fff;text-decoration:none;border-radius:999px;font-weight:700;font-size:15px;">Create Free Account</a>
                  </div>`
              }

              <!-- Quick Contact -->
              <div style="text-align:center;margin-bottom:8px;">
                <p style="font-size:14px;color:#6c6c85;margin:0 0 12px;">Need a faster response?</p>
                <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP ?? '923239999000'}" style="display:inline-block;padding:12px 24px;background:#25d366;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">WhatsApp Us</a>
              </div>
            </div>
            <div style="padding:24px 32px;border-top:1px solid rgba(124,58,237,0.12);text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#a0a0b8;">Best regards, <strong style="color:#f0f0f5;">The HydraBytes Team</strong></p>
              <p style="margin:0;font-size:12px;color:#6c6c85;">© ${new Date().getFullYear()} HydraBytes · contact@hydrabytes.tech</p>
            </div>
          </div>`,
      });
    } catch (clientEmailError) {
      console.error('[contact] Client email error:', clientEmailError);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
