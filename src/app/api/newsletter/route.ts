import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { enforceRateLimit, FIFTEEN_MINUTES } from '@/lib/rateLimit';
import { readJsonBody, requireJson, validateEmail } from '@/lib/validate';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, 'newsletter', 5, FIFTEEN_MINUTES);
  if (limited) return limited;

  const ctGuard = requireJson(req);
  if (ctGuard) return ctGuard;
  const parsed = await readJsonBody<{ email?: unknown }>(req);
  if (!parsed.ok) return parsed.response;

  const emailRes = validateEmail(parsed.data.email);
  if ('error' in emailRes) return NextResponse.json({ error: emailRes.error }, { status: emailRes.status });
  const normalizedEmail = emailRes.value;

  // Check for duplicate
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: 'This email is already subscribed.' }, { status: 409 });
  }

  // Save to DB
  await prisma.newsletterSubscriber.create({ data: { email: normalizedEmail } });

  // Send welcome email
  const { error: emailError } = await resend.emails.send({
    from: 'HydraBytes <hello@hydrabytes.it.com>',
    to: normalizedEmail,
    subject: 'Welcome to HydraBytes updates!',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); padding: 40px 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff;">Welcome to HydraBytes!</h1>
        </div>
        <div style="padding: 40px 32px;">
          <p style="font-size: 16px; line-height: 1.7; color: #a0a0b8; margin: 0 0 24px;">
            Thanks for subscribing! You're now part of the HydraBytes community. We'll keep you updated on the latest in web development, AI solutions, and digital innovation.
          </p>
          <p style="font-size: 16px; line-height: 1.7; color: #a0a0b8; margin: 0 0 32px;">
            Stay tuned for insights, project showcases, and exclusive updates delivered straight to your inbox.
          </p>
          <div style="text-align: center;">
            <a href="https://www.hydrabytes.it.com" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px;">
              Visit HydraBytes
            </a>
          </div>
        </div>
        <div style="padding: 24px 32px; border-top: 1px solid rgba(124,58,237,0.15); text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #6c6c85;">© ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
        </div>
      </div>
    `,
  });

  if (emailError) {
    console.error('[newsletter] Resend error:', emailError);
    return NextResponse.json({ error: 'Subscribed but welcome email failed to send.' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
