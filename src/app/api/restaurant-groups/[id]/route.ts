import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

/**
 * GET /api/restaurant-groups/[id]
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const isAdmin = session.role === UserRole.PLATFORM_ADMIN;
  const isOwner = session.restaurantGroupId === id;
  if (!isAdmin && !isOwner) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const group = await prisma.restaurantGroup.findFirst({
    where: { id },
    include: {
      restaurants: {
        where: { deletedAt: null },
        include: { branches: { where: { deletedAt: null } } },
      },
      subscription: { include: { plan: true } },
      owners: { where: { deletedAt: null }, select: { id: true, email: true, name: true } },
    },
  });
  if (!group) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(group);
}
