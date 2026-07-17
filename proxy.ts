/**
 * PlayBite — Route Protection Proxy (Next.js 16)
 *
 * Next.js 16 renamed middleware.ts → proxy.ts.
 * The exported function must be named `proxy` (not `middleware`).
 * Runs on the Node.js runtime (not Edge).
 * Uses jose to decode the session cookie without a DB call.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { ROUTES } from '@/constants/routes';

// ---------------------------------------------------------------------------
// Route maps
// ---------------------------------------------------------------------------

const DASHBOARD_ROUTES: Record<string, string[]> = {
  '/dashboard/customer': ['CUSTOMER'],
  '/dashboard/restaurant': ['RESTAURANT_OWNER', 'RESTAURANT_STAFF'],
  '/dashboard/admin': ['PLATFORM_ADMIN'],
};

const PUBLIC_AUTH_ROUTES = [
  ROUTES.AUTH_CUSTOMER_LOGIN,
  ROUTES.AUTH_RESTAURANT_LOGIN,
  ROUTES.AUTH_ADMIN_LOGIN,
  '/auth/otp',
  '/auth/complete-profile',
  '/auth/error',
  '/checkin', // Public check-in landing page — handles own auth redirect
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDashboardForRole(role: string): string {
  switch (role) {
    case 'RESTAURANT_OWNER':
    case 'RESTAURANT_STAFF':
      return ROUTES.DASHBOARD_RESTAURANT;
    case 'PLATFORM_ADMIN':
      return ROUTES.DASHBOARD_ADMIN;
    default:
      return ROUTES.DASHBOARD_CUSTOMER;
  }
}

async function decodeSession(request: NextRequest): Promise<{ userId: string; role: string } | null> {
  const raw = request.cookies.get('pb_session')?.value;
  if (!raw) return null;

  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(raw, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });
    if (typeof payload.userId !== 'string' || typeof payload.role !== 'string') return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Proxy function
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const session = await decodeSession(request);

  // ── Dashboard routes: require auth + correct role ─────────────────────────
  for (const [route, allowedRoles] of Object.entries(DASHBOARD_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!session) {
        const loginUrl = new URL(ROUTES.AUTH_CUSTOMER_LOGIN, request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
      if (!allowedRoles.includes(session.role)) {
        // Redirect to the correct dashboard for this user's role
        return NextResponse.redirect(new URL(getDashboardForRole(session.role), request.url));
      }
      return NextResponse.next();
    }
  }

  // ── Auth pages: redirect already-authed users to their dashboard ──────────
  const isPublicAuth = PUBLIC_AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isPublicAuth && session) {
    return NextResponse.redirect(new URL(getDashboardForRole(session.role), request.url));
  }

  return NextResponse.next();
}

// Run on all routes except Next.js internals and static assets
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
