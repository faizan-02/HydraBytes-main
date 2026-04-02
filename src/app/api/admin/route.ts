import { NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [submissions, projects, users] = await Promise.all([
    prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({ submissions, projects, users });
}

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { type, id, status } = await req.json();

  if (type === 'project') {
    const updated = await prisma.project.update({ where: { id }, data: { status } });
    return NextResponse.json(updated);
  }

  if (type === 'submission') {
    const updated = await prisma.contactSubmission.update({ where: { id }, data: { status } });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
