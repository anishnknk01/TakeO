import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

/**
 * GET /api/staff
 * Returns staff for the current owner's group.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
  const search = searchParams.get('search') ?? '';
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    restaurant: { restaurantGroupId: session.restaurantGroupId! },
    ...(search ? { OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
    ]} : {}),
  };

  const [items, total] = await Promise.all([
    prisma.restaurantStaff.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, name: true, isActive: true, createdAt: true,
        branchAssignments: { include: { branch: { select: { id: true, name: true } } } },
      },
    }),
    prisma.restaurantStaff.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}
