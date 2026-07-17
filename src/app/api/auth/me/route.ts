import { NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's minimal profile.
 * Returns 401 if no valid session cookie is present.
 */
export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  let user: Record<string, unknown> | null = null;

  if (session.role === UserRole.CUSTOMER) {
    const customer = await prisma.customer.findUnique({
      where: { id: session.userId, deletedAt: null },
      select: {
        id: true,
        displayHandle: true,
        totalPoints: true,
        isActive: true,
        restaurantGroupId: true,
        profile: { select: { firstName: true, lastName: true } },
      },
    });
    user = customer as Record<string, unknown> | null;
  } else if (session.role === UserRole.RESTAURANT_OWNER) {
    const owner = await prisma.restaurantOwner.findUnique({
      where: { id: session.userId, deletedAt: null },
      select: { id: true, email: true, name: true, restaurantGroupId: true },
    });
    user = owner as Record<string, unknown> | null;
  } else if (session.role === UserRole.PLATFORM_ADMIN) {
    const admin = await prisma.admin.findUnique({
      where: { id: session.userId, deletedAt: null },
      select: { id: true, email: true, name: true },
    });
    user = admin as Record<string, unknown> | null;
  }

  if (!user) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  return NextResponse.json({ user, role: session.role });
}
