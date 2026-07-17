import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { createSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

/**
 * POST /api/auth/refresh
 * Uses the refresh token cookie to issue a new session.
 * Returns 401 if the refresh token is missing, expired, or invalid.
 */
export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const refreshRaw = cookieStore.get('pb_refresh')?.value;
  if (!refreshRaw) {
    return NextResponse.json({ error: 'no_refresh_token' }, { status: 401 });
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) return NextResponse.json({ error: 'server_error' }, { status: 500 });

  let payload: { userId?: string } | null = null;
  try {
    const { payload: p } = await jwtVerify(refreshRaw, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });
    payload = p as { userId?: string };
  } catch {
    return NextResponse.json({ error: 'invalid_refresh_token' }, { status: 401 });
  }

  if (!payload?.userId) {
    return NextResponse.json({ error: 'invalid_refresh_token' }, { status: 401 });
  }

  const userId = payload.userId;

  // Determine which user table owns this ID
  const [customer, owner, admin] = await Promise.all([
    prisma.customer.findUnique({ where: { id: userId, deletedAt: null }, select: { id: true, restaurantGroupId: true } }),
    prisma.restaurantOwner.findUnique({ where: { id: userId, deletedAt: null }, select: { id: true, restaurantGroupId: true } }),
    prisma.admin.findUnique({ where: { id: userId, deletedAt: null }, select: { id: true } }),
  ]);

  let role: UserRole;
  let restaurantGroupId: string | null = null;

  if (customer) {
    role = UserRole.CUSTOMER;
    restaurantGroupId = customer.restaurantGroupId;
  } else if (owner) {
    role = UserRole.RESTAURANT_OWNER;
    restaurantGroupId = owner.restaurantGroupId;
  } else if (admin) {
    role = UserRole.PLATFORM_ADMIN;
  } else {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  await createSession({ userId, role, restaurantGroupId });
  return NextResponse.json({ success: true });
}
