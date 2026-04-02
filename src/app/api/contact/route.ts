import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

const TEAM_EMAIL = process.env.TEAM_EMAIL!;

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
      return NextResponse.json(
        { error: 'Name, email, service, and message are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const serviceLabel = SERVICE_LABELS[service] || service;
    const budgetLabel = budget || 'Not specified';

    // Save to database
    await prisma.contactSubmission.create({
      data: {
        name,
        email,
        budget: budgetLabel,
        service: serviceLabel,
        message,
        status: 'new',
      },
    });

    // Notify team
    await resend.emails.send({
      from: 'HydraBytes Contact <onboarding@resend.dev>',
      to: TEAM_EMAIL,
      subject: `New Inquiry: ${name} — ${serviceLabel}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#6366f1;margin-bottom:24px;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#6366f1;">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Service</td><td style="padding:8px 0;">${serviceLabel}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Budget</td><td style="padding:8px 0;">${budgetLabel}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:8px;border-left:4px solid #6366f1;">
            <p style="color:#6b7280;font-size:12px;margin:0 0 8px;">Message</p>
            <p style="margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="margin-top:24px;font-size:12px;color:#9ca3af;">Submitted via hydrabytes.it.com</p>
        </div>
      `,
    });

    // Confirm to client
    await resend.emails.send({
      from: 'HydraBytes <onboarding@resend.dev>',
      to: email,
      subject: "We received your message — HydraBytes",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#6366f1;">Thanks for reaching out, ${name}!</h2>
          <p style="color:#374151;line-height:1.6;">
            We've received your inquiry about <strong>${serviceLabel}</strong> and will get back to you within <strong>24 hours</strong>.
          </p>
          <p style="color:#374151;line-height:1.6;">
            In the meantime, explore our <a href="https://hydrabytes.it.com/portfolio" style="color:#6366f1;">portfolio</a> or learn more <a href="https://hydrabytes.it.com/about" style="color:#6366f1;">about us</a>.
          </p>
          <p style="color:#374151;">Best regards,<br/><strong>The HydraBytes Team</strong></p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
          <p style="font-size:12px;color:#9ca3af;">HydraBytes · hydrabytes4@gmail.com</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
