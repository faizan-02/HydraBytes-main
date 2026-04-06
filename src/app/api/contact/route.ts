import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { auth } from '@/../auth';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
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
  try {
    const body = await req.json();
    const { name, email, service, budget, message } = body;

    if (!name || !email || !message || !service) {
      return NextResponse.json({ error: 'Name, email, service, and message are required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const serviceLabel = SERVICE_LABELS[service] || service;
    const budgetLabel = budget || 'Not specified';

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
    const hmacSecret = process.env.AUTH_SECRET ?? 'hydrabytes_fallback_secret';
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
    const { error: teamEmailError } = await resend.emails.send({
      from: 'HydraBytes Contact <hello@hydrabytes.it.com>',
      to: TEAM_EMAIL,
      subject: `New Inquiry: ${name} - ${serviceLabel}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0f;color:#e2e8f0;">
          <h2 style="color:#6366f1;margin-bottom:24px;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#94a3b8;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#6366f1;">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Service</td><td style="padding:8px 0;">${serviceLabel}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Budget</td><td style="padding:8px 0;">${budgetLabel}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#1e293b;border-radius:8px;border-left:4px solid #6366f1;">
            <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">Message</p>
            <p style="margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          ${verifySection}${guestVerifySection}
          <p style="margin-top:24px;font-size:12px;color:#475569;">Submitted via hydrabytes.it.com</p>
        </div>`,
    });

    if (teamEmailError) {
      console.error('[contact] Team email error:', teamEmailError);
    }

    // Confirm to client
    const { error: clientEmailError } = await resend.emails.send({
      from: 'HydraBytes <hello@hydrabytes.it.com>',
      to: email,
      subject: "We received your message — HydraBytes",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#6366f1;">Thanks for reaching out, ${name}!</h2>
          <p style="color:#374151;line-height:1.6;">We've received your inquiry about <strong>${serviceLabel}</strong> and will get back to you within <strong>24 hours</strong>.</p>
          ${projectId
            ? `<div style="margin:20px 0;padding:16px;background:#f0f9ff;border-radius:8px;border-left:4px solid #6366f1;"><p style="margin:0;color:#1e40af;font-size:14px;">Your project has been added to your <a href="${BASE_URL}/dashboard" style="color:#6366f1;font-weight:600;">dashboard</a> and is pending verification from our team.</p></div>`
            : `<div style="margin:20px 0;padding:16px;background:#faf5ff;border-radius:8px;border-left:4px solid #7c3aed;"><p style="margin:0 0 10px;color:#5b21b6;font-size:14px;font-weight:600;">Want to track your inquiry status?</p><p style="margin:0 0 14px;color:#6b7280;font-size:14px;">Create a free account to see real-time updates, receive project notifications, and manage invoices.</p><a href="${BASE_URL}/auth/register?email=${encodeURIComponent(email)}" style="display:inline-block;padding:10px 20px;background:linear-gradient(135deg,#7c3aed,#0891b2);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Create Free Account</a></div>`
          }
          <p style="color:#374151;line-height:1.6;">For quick enquiries, WhatsApp us at <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP ?? '923239999000'}" style="color:#6366f1;">+92 323 9999 000</a>.</p>
          <p style="color:#374151;">Best regards,<br/><strong>The HydraBytes Team</strong></p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
          <p style="font-size:12px;color:#9ca3af;">HydraBytes · hydrabytes4@gmail.com</p>
        </div>`,
    });

    if (clientEmailError) {
      console.error('[contact] Client email error:', clientEmailError);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
