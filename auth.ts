import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        if (!user.emailVerified) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session: sessionUpdate }) {
      // Handle session updates (name change, profile completion)
      if (trigger === 'update') {
        if (sessionUpdate?.name) token.name = sessionUpdate.name;
        if (sessionUpdate?.profileComplete !== undefined) token.profileComplete = sessionUpdate.profileComplete;
      }

      // Re-validate role and check passwordChangedAt on existing sessions
      if (!user && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, passwordChangedAt: true, email: true },
          });
          if (!dbUser) return { ...token, invalidated: true };
          token.role = dbUser.role;
          token.email = dbUser.email;
          if (dbUser.passwordChangedAt) {
            const iat = (token.iat as number) * 1000;
            if (dbUser.passwordChangedAt.getTime() > iat) {
              return { ...token, invalidated: true };
            }
          }
        } catch { /* DB unavailable — keep existing token */ }
      }

      // Credentials login — user object has id and role directly
      if (user && account?.provider === 'credentials') {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'user';
        token.hasPassword = true;
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: user.id as string }, select: { phone: true, company: true } });
          token.profileComplete = !!(dbUser?.phone && dbUser?.company);
        } catch { token.profileComplete = false; }
      }
      // OAuth first sign-in — upsert user and get DB id/role (with retry for cold DB starts)
      if (account && (account.provider === 'google' || account.provider === 'github')) {
        const email = (token.email as string)?.toLowerCase();
        if (email) {
          let lastErr: unknown;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              if (attempt > 0) await new Promise(r => setTimeout(r, 500 * attempt));
              const existingUser = await prisma.user.findUnique({ where: { email } });
              const oauthFirstName = (token.name as string)?.split(' ')[0] ?? null;
              const dbUser = await prisma.user.upsert({
                where: { email },
                update: {},
                create: { email, name: oauthFirstName, role: 'user', emailVerified: true },
              });
              token.id = dbUser.id;
              token.role = dbUser.role;
              token.hasPassword = !!dbUser.password;
              token.profileComplete = !!(dbUser.phone && dbUser.company);
              // Always use the DB name so custom names set via settings are preserved;
              // fall back to OAuth first name if the DB has no name stored
              token.name = dbUser.name ?? oauthFirstName;

              // New OAuth user — link any accepted guest submissions to projects
              if (!existingUser) {
                const contactedSubmissions = await prisma.contactSubmission.findMany({
                  where: { email: { equals: email, mode: 'insensitive' }, status: 'contacted' },
                });
                if (contactedSubmissions.length > 0) {
                  await prisma.project.createMany({
                    data: contactedSubmissions.map(s => ({
                      userId: dbUser.id,
                      title: `${s.service} Project`,
                      service: s.service,
                      budget: s.budget,
                      description: s.message,
                      status: 'accepted',
                    })),
                  });
                }
              }
              lastErr = null;
              break; // success — exit retry loop
            } catch (err) {
              lastErr = err;
            }
          }
          if (lastErr) console.error('OAuth JWT DB error after retries:', lastErr);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.invalidated) return { ...session, user: undefined } as unknown as typeof session;
      if (token) {
        type U = { id?: string; role?: string; hasPassword?: boolean; profileComplete?: boolean };
        (session.user as U).id = token.id as string;
        (session.user as U).role = (token.role as string) ?? 'user';
        (session.user as U).hasPassword = (token.hasPassword as boolean) ?? false;
        (session.user as U).profileComplete = (token.profileComplete as boolean) ?? false;
      }
      return session;
    },
  },
});
