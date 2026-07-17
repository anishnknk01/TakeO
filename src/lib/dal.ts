/**
 * Data Access Layer — centralises all auth verification and user lookups.
 * All functions are server-only and memoised per React render via `cache`.
 */
import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { ROUTES } from '@/constants/routes';
import { UserRole } from '@/types/auth';

// ---------------------------------------------------------------------------
// Core session verification
// ---------------------------------------------------------------------------

/** Verifies the session cookie and returns the payload, or redirects to login. */
export const verifySession = cache(async () => {
  const session = await getSessionPayload();
  if (!session?.userId) {
    redirect(ROUTES.AUTH_CUSTOMER_LOGIN);
  }
  return session;
});

/** Like verifySession but returns null instead of redirecting. */
export const getOptionalSession = cache(async () => {
  return getSessionPayload();
});

// ---------------------------------------------------------------------------
// Role guards
// ---------------------------------------------------------------------------

export async function requireRole(...allowedRoles: UserRole[]) {
  const session = await verifySession();
  if (!allowedRoles.includes(session.role)) {
    redirect(ROUTES.HOME);
  }
  return session;
}

// ---------------------------------------------------------------------------
// User lookups — return minimal DTOs, never raw DB rows
// ---------------------------------------------------------------------------

export const getCurrentCustomer = cache(async () => {
  const session = await verifySession();
  if (session.role !== UserRole.CUSTOMER) return null;

  const customer = await prisma.customer.findUnique({
    where: { id: session.userId, deletedAt: null },
    select: {
      id: true,
      displayHandle: true,
      totalPoints: true,
      isActive: true,
      isBanned: true,
      restaurantGroupId: true,
      profile: {
        select: { firstName: true, lastName: true, marketingConsent: true },
      },
    },
  });
  return customer;
});

export const getCurrentOwner = cache(async () => {
  const session = await verifySession();
  if (session.role !== UserRole.RESTAURANT_OWNER) return null;

  return prisma.restaurantOwner.findUnique({
    where: { id: session.userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      restaurantGroupId: true,
    },
  });
});

export const getCurrentAdmin = cache(async () => {
  const session = await verifySession();
  if (session.role !== UserRole.PLATFORM_ADMIN) return null;

  return prisma.admin.findUnique({
    where: { id: session.userId, deletedAt: null },
    select: { id: true, email: true, name: true, isActive: true },
  });
});
