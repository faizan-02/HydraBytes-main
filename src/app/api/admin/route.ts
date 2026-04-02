import { NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://hydrabytes.it.com';

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
      select: { id: true, name: true, email: true, role: true, createdAt: true },
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

  const { type, id, status } = await req.json();

  if (type === 'project') {
    const updated = await prisma.project.update({
      where: { id },
      data: { status },
      include: { user: { select: { email: true, name: true } } },
    });

    const notifyStatuses: Record<string, string> = {
      in_progress: 'Great news! Your project is now in progress.',
      planning: 'Your project has entered the planning phase.',
      review: 'Your project is currently under review.',
      completed: 'Your project has been completed! 🎉',
    };

    if (updated.user?.email && notifyStatuses[status]) {
      const message = notifyStatuses[status];
      const userName = updated.user.name ?? 'there';

      await resend.emails.send({
        from: 'HydraBytes <onboarding@resend.dev>',
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
                <p style="margin: 0; font-size: 15px; color: #f0f0f5; font-weight: 600;">Project: ${updated.title}</p>
                <p style="margin: 6px 0 0; font-size: 14px; color: #a0a0b8;">Service: ${updated.service}</p>
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

  if (type === 'submission') {
    const updated = await prisma.contactSubmission.update({ where: { id }, data: { status } });
    return NextResponse.json(updated);
  }

  if (type === 'invoice') {
    const updated = await prisma.invoice.update({ where: { id }, data: { status } });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { projectId, userId, amount, dueDate, description } = await req.json();

  if (!userId || !amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Invalid invoice data. Amount must be greater than 0.' }, { status: 400 });
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
  const projectName = project?.title ?? 'General Services';
  const userName = user.name ?? 'there';
  const paymentPageUrl = `${BASE_URL}/payment/local/${invoice.id}`;

  await resend.emails.send({
    from: 'HydraBytes <onboarding@resend.dev>',
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
              ${description ? `<tr><td style="padding: 8px 0; color: #a0a0b8; font-size: 14px; border-top: 1px solid rgba(124,58,237,0.15);">Note</td><td style="padding: 8px 0; color: #f0f0f5; font-size: 14px; text-align: right; border-top: 1px solid rgba(124,58,237,0.15);">${description}</td></tr>` : ''}
            </table>
          </div>
          <div style="text-align: center;">
            <a href="${paymentPageUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 700; font-size: 16px;">
              💳 Pay Now
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
