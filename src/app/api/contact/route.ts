import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { auth } from '@/../auth';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
const TEAM_EMAIL = process.env.TEAM_EMAIL!;
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const SERVICE_LABELS: Record<string, string> = {
  web: 'Web Development',
  app: 'App Development',
  ai: 'AI & ML Solutions',
  design: 'UI/UX Design',
  other: 'Other',
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

    // Check if user is logged in
    const session = await auth();
    let projectId: string | null = null;
    let verifyToken: string | null = null;

    if (session?.user?.id) {
      verifyToken = crypto.randomBytes(32).toString('hex');
      const project = await prisma.project.create({
        data: {
          userId: session.user.id,
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

    // Save contact submission
    await prisma.contactSubmission.create({
      data: { name, email, budget: budgetLabel, service: serviceLabel, message, status: 'new' },
    });

    const verifySection = projectId && verifyToken ? `
      <div style="margin-top:24px;padding:20px;background:#0f172a;border-radius:10px;border:1px solid rgba(99,102,241,0.3);">
        <p style="margin:0 0 4px;font-weight:600;color:#a5b4fc;">👤 Registered User Project</p>
        <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">Review this inquiry and accept or decline it. The client will be notified automatically.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <a href="${BASE_URL}/api/verify-project?token=${verifyToken}&action=accept"
             style="display:inline-block;padding:12px 24px;background:#4ade80;color:#0a0a0f;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
            ✅ Accept Project
          </a>
          <a href="${BASE_URL}/api/verify-project?token=${verifyToken}&action=decline"
             style="display:inline-block;padding:12px 24px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
            ❌ Decline Project
          </a>
        </div>
        <p style="margin:12px 0 0;font-size:12px;color:#64748b;">Project ID: ${projectId}</p>
      </div>` : '';

    // Notify team
    await resend.emails.send({
      from: 'HydraBytes Contact <onboarding@resend.dev>',
      to: TEAM_EMAIL,
      subject: `New Inquiry: ${name} — ${serviceLabel}`,
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
          ${verifySection}
          <p style="margin-top:24px;font-size:12px;color:#475569;">Submitted via hydrabytes.it.com</p>
        </div>`,
    });

    // Confirm to client
    await resend.emails.send({
      from: 'HydraBytes <onboarding@resend.dev>',
      to: email,
      subject: "We received your message — HydraBytes",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#6366f1;">Thanks for reaching out, ${name}!</h2>
          <p style="color:#374151;line-height:1.6;">We've received your inquiry about <strong>${serviceLabel}</strong> and will get back to you within <strong>24 hours</strong>.</p>
          ${projectId ? `<div style="margin:20px 0;padding:16px;background:#f0f9ff;border-radius:8px;border-left:4px solid #6366f1;"><p style="margin:0;color:#1e40af;font-size:14px;">📊 Your project has been added to your <a href="${BASE_URL}/dashboard" style="color:#6366f1;font-weight:600;">dashboard</a> and is pending verification from our team.</p></div>` : ''}
          <p style="color:#374151;line-height:1.6;">For quick enquiries, WhatsApp us at <a href="https://wa.me/923239999000" style="color:#6366f1;">+92 323 9999 000</a>.</p>
          <p style="color:#374151;">Best regards,<br/><strong>The HydraBytes Team</strong></p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
          <p style="font-size:12px;color:#9ca3af;">HydraBytes · hydrabytes4@gmail.com</p>
        </div>`,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
