import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token || token.length !== 64) {
    return NextResponse.json({ error: 'Invalid unsubscribe token.' }, { status: 400 });
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
  });

  if (!subscriber) {
    return NextResponse.json({ error: 'Token not found or already unsubscribed.' }, { status: 404 });
  }

  await prisma.newsletterSubscriber.delete({ where: { id: subscriber.id } });

  return NextResponse.json({ success: true });
}
