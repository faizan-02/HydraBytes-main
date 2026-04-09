import { NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { readJsonBody, requireJson, escapeHtml } from '@/lib/validate';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://hydrabytes.it.com';

const ALLOWED_PROJECT_STATUSES = new Set([
  'pending_verification', 'accepted', 'declined', 'planning', 'in_progress', 'review', 'completed',
]);
const ALLOWED_SUBMISSION_STATUSES = new Set(['new', 'contacted', 'closed']);
const ALLOWED_INVOICE_STATUSES = new Set(['pending', 'under_review', 'paid', 'cancelled']);

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [submissions, projects, users, invoices] = await Promise.all([
    prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, phone: true, company: true, createdAt: true },
    }),
    prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, project: { select: { title: true } } },
    }),
  ]);

  return NextResponse.json({ submissions, projects, users, invoices });
}

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ctGuard = requireJson(req);
  if (ctGuard) return ctGuard;
  const parsed = await readJsonBody<{ type?: unknown; id?: unknown; status?: unknown }>(req);
  if (!parsed.ok) return parsed.response;
  const { type, id, status } = parsed.data;

  if (typeof type !== 'string' || typeof id !== 'string' || id.length === 0 || id.length > 128) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (status !== undefined && (typeof status !== 'string' || status.length > 64)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  if (type === 'project') {
    if (typeof status !== 'string' || !ALLOWED_PROJECT_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid project status.' }, { status: 400 });
    }
    const updated = await prisma.project.update({
      where: { id },
      data: { status },
      include: { user: { select: { email: true, name: true } } },
    });

    const notifyStatuses: Record<string, string> = {
      in_progress: 'Great news! Your project is now in progress.',
      planning: 'Your project has entered the planning phase.',
      review: 'Your project is currently under review.',
      completed: 'Your project has been completed.',
    };

    if (updated.user?.email && notifyStatuses[status]) {
      const message = notifyStatuses[status];
      const userName = escapeHtml(updated.user.name ?? 'there');
      const safeTitle = escapeHtml(updated.title);
      const safeService = escapeHtml(updated.service);

      await resend.emails.send({
        from: 'HydraBytes <hello@hydrabytes.it.com>',
        to: updated.user.email,
        subject: `Update on your project: ${updated.title}`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">Project Update</h1>
            </div>
            <div style="padding: 40px 32px;">
              <p style="font-size: 16px; color: #a0a0b8; margin: 0 0 16px;">Hi ${userName},</p>
              <p style="font-size: 16px; line-height: 1.7; color: #a0a0b8; margin: 0 0 24px;">${message}</p>
              <div style="background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 10px; padding: 20px; margin-bottom: 32px;">
                <p style="margin: 0; font-size: 15px; color: #f0f0f5; font-weight: 600;">Project: ${safeTitle}</p>
                <p style="margin: 6px 0 0; font-size: 14px; color: #a0a0b8;">Service: ${safeService}</p>
              </div>
              <div style="text-align: center;">
                <a href="${BASE_URL}/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px;">
                  View Dashboard
                </a>
              </div>
            </div>
            <div style="padding: 24px 32px; border-top: 1px solid rgba(124,58,237,0.15); text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #6c6c85;">© ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
            </div>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json(updated);
  }

  if (type === 'invite') {
    const submission = await prisma.contactSubmission.findUnique({ where: { id } });
    if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.contactSubmission.update({ where: { id }, data: { status: 'contacted' } });

    const registerUrl = `${BASE_URL}/auth/register?email=${encodeURIComponent(submission.email)}`;
    const userName = escapeHtml(submission.name || 'there');
    const serviceName = escapeHtml(submission.service || 'your project');

    await resend.emails.send({
      from: 'HydraBytes <hello@hydrabytes.it.com>',
      to: submission.email,
      subject: 'Your HydraBytes inquiry has been reviewed',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">Great News!</h1>
          </div>
          <div style="padding: 40px 32px;">
            <p style="font-size: 16px; color: #a0a0b8; margin: 0 0 16px;">Hi ${userName},</p>
            <p style="font-size: 16px; line-height: 1.7; color: #a0a0b8; margin: 0 0 24px;">
              We've reviewed your inquiry for <strong style="color: #f0f0f5;">${serviceName}</strong> and we're excited to work with you!
            </p>
            <div style="background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 10px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 15px; color: #f0f0f5; font-weight: 600; text-align: center;">
                Create your free account to track your project in real-time
              </p>
            </div>
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${registerUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 700; font-size: 16px;">
                Create Your Account &rarr;
              </a>
            </div>
            <p style="font-size: 14px; color: #a0a0b8; margin: 0 0 8px;">With your account you can:</p>
            <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 14px; color: #a0a0b8; line-height: 2;">
              <li>Track project status in real-time</li>
              <li>Receive and pay invoices securely</li>
              <li>Direct access to your developer</li>
              <li>Get real-time updates on progress</li>
            </ul>
            <p style="font-size: 13px; color: #6c6c85; margin: 0;">
              Already have an account? <a href="${BASE_URL}/auth/signin" style="color: #818cf8; text-decoration: none;">Sign in here</a>
            </p>
          </div>
          <div style="padding: 24px 32px; border-top: 1px solid rgba(124,58,237,0.15); text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #6c6c85;">&copy; ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
          </div>
        </div>
      `,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  }

  if (type === 'submission') {
    if (typeof status !== 'string' || !ALLOWED_SUBMISSION_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid submission status.' }, { status: 400 });
    }
    const updated = await prisma.contactSubmission.update({ where: { id }, data: { status } });
    return NextResponse.json(updated);
  }

  if (type === 'invoice') {
    if (typeof status !== 'string' || !ALLOWED_INVOICE_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid invoice status.' }, { status: 400 });
    }
    const updated = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: { user: { select: { email: true, name: true } }, project: { select: { title: true } } },
    });

    if (status === 'paid' && updated.user?.email) {
      const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(updated.amount);
      const userName = escapeHtml(updated.user.name ?? 'there');
      const safeProjectTitle = escapeHtml(updated.project?.title ?? 'General Services');
      await resend.emails.send({
        from: 'HydraBytes <hello@hydrabytes.it.com>',
        to: updated.user.email,
        subject: `Payment Confirmed — ${formattedAmount} received`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">Payment Confirmed</h1>
            </div>
            <div style="padding: 40px 32px;">
              <p style="font-size: 16px; color: #a0a0b8; margin: 0 0 16px;">Hi ${userName},</p>
              <p style="font-size: 16px; line-height: 1.7; color: #a0a0b8; margin: 0 0 24px;">
                We have verified and confirmed your payment. Thank you for working with HydraBytes!
              </p>
              <div style="background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); border-radius: 10px; padding: 24px; margin-bottom: 32px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #a0a0b8; font-size: 14px;">Project</td>
                    <td style="padding: 8px 0; color: #f0f0f5; font-size: 14px; font-weight: 600; text-align: right;">${safeProjectTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(34,197,94,0.15);">Amount Paid</td>
                    <td style="padding: 8px 0; color: #22c55e; font-size: 20px; font-weight: 800; text-align: right; border-top: 1px solid rgba(34,197,94,0.15);">${formattedAmount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(34,197,94,0.15);">Status</td>
                    <td style="padding: 8px 0; text-align: right; border-top: 1px solid rgba(34,197,94,0.15);"><span style="padding: 4px 12px; background: rgba(34,197,94,0.1); color: #22c55e; border-radius: 999px; font-size: 13px; font-weight: 600;">Paid</span></td>
                  </tr>
                </table>
              </div>
              <div style="text-align: center;">
                <a href="${BASE_URL}/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px;">
                  View Dashboard
                </a>
              </div>
            </div>
            <div style="padding: 24px 32px; border-top: 1px solid rgba(34,197,94,0.15); text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #6c6c85;">© ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
            </div>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ctGuard = requireJson(req);
  if (ctGuard) return ctGuard;
  const parsed = await readJsonBody<{
    projectId?: unknown;
    userId?: unknown;
    amount?: unknown;
    dueDate?: unknown;
    description?: unknown;
  }>(req);
  if (!parsed.ok) return parsed.response;
  const { projectId, userId, amount, dueDate, description } = parsed.data;

  if (typeof userId !== 'string' || userId.length === 0 || userId.length > 128) {
    return NextResponse.json({ error: 'Invalid user.' }, { status: 400 });
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) {
    return NextResponse.json({ error: 'Invalid invoice data. Amount must be greater than 0.' }, { status: 400 });
  }
  if (projectId !== undefined && projectId !== null && (typeof projectId !== 'string' || projectId.length > 128)) {
    return NextResponse.json({ error: 'Invalid project.' }, { status: 400 });
  }
  if (description !== undefined && description !== null && (typeof description !== 'string' || description.length > 1000)) {
    return NextResponse.json({ error: 'Invalid description.' }, { status: 400 });
  }
  if (dueDate !== undefined && dueDate !== null && typeof dueDate !== 'string') {
    return NextResponse.json({ error: 'Invalid due date.' }, { status: 400 });
  }

  const [user, project] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
    projectId ? prisma.project.findUnique({ where: { id: projectId }, select: { title: true } }) : Promise.resolve(null),
  ]);

  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  const invoice = await prisma.invoice.create({
    data: {
      userId,
      projectId: projectId ?? null,
      amount,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'pending',
    },
    include: { project: { select: { title: true } } },
  });

  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified';
  const projectName = escapeHtml(project?.title ?? 'General Services');
  const userName = escapeHtml(user.name ?? 'there');
  const safeDescription = description ? escapeHtml(description) : '';
  const paymentPageUrl = `${BASE_URL}/payment/local/${invoice.id}`;

  await resend.emails.send({
    from: 'HydraBytes <hello@hydrabytes.it.com>',
    to: user.email,
    subject: `Invoice from HydraBytes — ${formattedAmount}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f5; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%); padding: 40px 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">New Invoice</h1>
        </div>
        <div style="padding: 40px 32px;">
          <p style="font-size: 16px; color: #a0a0b8; margin: 0 0 16px;">Hi ${userName},</p>
          <p style="font-size: 16px; line-height: 1.7; color: #a0a0b8; margin: 0 0 24px;">
            A new invoice has been issued for your project. Please find the details below and use the Pay Now button to complete your payment.
          </p>
          <div style="background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 10px; padding: 24px; margin-bottom: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #a0a0b8; font-size: 14px;">Project</td>
                <td style="padding: 8px 0; color: #f0f0f5; font-size: 14px; font-weight: 600; text-align: right;">${projectName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Amount</td>
                <td style="padding: 8px 0; color: #7c3aed; font-size: 20px; font-weight: 800; text-align: right; border-top: 1px solid rgba(124,58,237,0.15);">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Due Date</td>
                <td style="padding: 8px 0; color: #f0f0f5; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid rgba(124,58,237,0.15);">${formattedDueDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Status</td>
                <td style="padding: 8px 0; text-align: right; border-top: 1px solid rgba(124,58,237,0.15);"><span style="padding: 4px 12px; background: rgba(251,191,36,0.1); color: #fbbf24; border-radius: 999px; font-size: 13px; font-weight: 600;">Pending</span></td>
              </tr>
              ${safeDescription ? `<tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Note</td><td style="padding: 8px 0; color: #f0f0f5; font-size: 14px; text-align: right; border-top: 1px solid rgba(124,58,237,0.15);">${safeDescription}</td></tr>` : ''}
            </table>
          </div>
          <div style="text-align: center;">
            <a href="${paymentPageUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 700; font-size: 16px;">
              Pay Now
            </a>
          </div>
          <p style="margin: 20px 0 0; font-size: 13px; color: #6c6c85; text-align: center;">
            Supports Easypaisa · JazzCash · NayaPay · Bank Transfer
          </p>
        </div>
        <div style="padding: 24px 32px; border-top: 1px solid rgba(124,58,237,0.15); text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #6c6c85;">© ${new Date().getFullYear()} HydraBytes. All rights reserved.</p>
        </div>
      </div>
    `,
  }).catch(() => {});

  return NextResponse.json(invoice, { status: 201 });
}
