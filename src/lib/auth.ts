import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { UserRole } from '@/types/auth';
import { ROUTES } from '@/constants/routes';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Phone / Email', type: 'text' },
        role: { label: 'Role', type: 'text' },
      },
      // Phase 1 stub: always returns null (no real auth yet)
      // Phase 2 will implement OTP verification here
      async authorize() {
        return null;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role?: UserRole }).role ?? UserRole.CUSTOMER;
        token.restaurantGroupId =
          (user as { restaurantGroupId?: string | null }).restaurantGroupId ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as UserRole;
        session.user.restaurantGroupId = token.restaurantGroupId as string | null;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // If the URL is relative, redirect to it
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // If same origin, allow
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: ROUTES.AUTH_CUSTOMER_LOGIN,
    error: '/auth/error',
  },
});
