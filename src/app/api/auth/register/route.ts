import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Link any accepted guest submissions to a project so the dashboard is populated
    const contactedSubmissions = await prisma.contactSubmission.findMany({
      where: { email, status: 'contacted' },
    });

    if (contactedSubmissions.length > 0) {
      await prisma.project.createMany({
        data: contactedSubmissions.map(s => ({
          userId: user.id,
          title: `${s.service} Project`,
          service: s.service,
          budget: s.budget,
          description: s.message,
          status: 'accepted',
        })),
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
