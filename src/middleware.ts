import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/../auth';

const PROTECTED_ROUTES = ['/dashboard', '/admin'];
const PROTECTED_API_ROUTES = ['/api/dashboard', '/api/user/settings', '/api/admin'];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Auth check for protected routes
  const isProtected = PROTECTED_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
  const isProtectedApi = PROTECTED_API_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));

  if (isProtected || isProtectedApi) {
    if (!req.auth?.user) {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
      }
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if ((req.auth.user as { role?: string }).role !== 'admin') {
        if (isProtectedApi) {
          return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  const res = NextResponse.next();

  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.posthog.com https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com https://avatars.githubusercontent.com; connect-src 'self' https://*.posthog.com https://*.sentry.io https://api.tronscan.org; frame-ancestors 'none';"
  );

  return res;
}) as (req: NextRequest) => NextResponse | Promise<NextResponse>;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|txt|xml)$).*)'],
};
