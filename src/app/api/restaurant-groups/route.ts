import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

/**
 * GET /api/restaurant-groups
 * Admin only — list all groups with counts.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.PLATFORM_ADMIN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
  const search = searchParams.get('search') ?? '';
  const includeDeleted = searchParams.get('includeDeleted') === 'true';
  const skip = (page - 1) * limit;

  const where = {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.restaurantGroup.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, slug: true, isChain: true, deletedAt: true, createdAt: true,
        _count: { select: { restaurants: { where: { deletedAt: null } }, customers: { where: { deletedAt: null } } } },
        subscription: { select: { status: true, plan: { select: { name: true, tier: true } } } },
      },
    }),
    prisma.restaurantGroup.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}
