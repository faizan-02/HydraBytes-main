import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
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

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        if (!user.email) return false;
        try {
          const existing = await prisma.user.findUnique({ where: { email: user.email } });
          if (!existing) {
            await prisma.user.create({
              data: { email: user.email, name: user.name ?? null, role: 'user' },
            });
          }
        } catch (err) {
          console.error('OAuth DB error:', err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Credentials login — user object has id and role directly
      if (user && account?.provider === 'credentials') {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'user';
      }
      // OAuth first sign-in — look up DB user by email
      if (account && (account.provider === 'google' || account.provider === 'github')) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { email: token.email as string } });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch (err) {
          console.error('JWT DB lookup error:', err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as { id?: string; role?: string }).id = token.id as string;
        (session.user as { id?: string; role?: string }).role = (token.role as string) ?? 'user';
      }
      return session;
    },
  },
});
