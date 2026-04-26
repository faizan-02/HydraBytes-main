import { NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [projects, invoices] = await Promise.all([
    prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, service: true, status: true,
        budget: true, description: true, startDate: true, endDate: true, createdAt: true,
      },
    }),
    prisma.invoice.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, amount: true, status: true, dueDate: true,
        paymentMethod: true, createdAt: true,
        project: { select: { title: true } },
      },
    }),
  ]);

  return NextResponse.json({ projects, invoices });
}
