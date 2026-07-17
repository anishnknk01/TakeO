/**
 * GET /api/games?branchId=
 * Returns games available for a branch.
 * Customer must have an active visit at that branch — or be an owner/admin listing catalog.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import { getActiveVisit } from '@/lib/checkin';
import { getAvailableGames } from '@/lib/game';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const QuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(['PENDING_REVIEW', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = QuerySchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_params' }, { status: 400 });

  const { branchId, page, limit, status, search } = parsed.data;

  // Customer path: games available at their active visit's branch
  if (session.role === UserRole.CUSTOMER) {
    const visit = await getActiveVisit(session.userId);
    if (!visit) return NextResponse.json({ error: 'no_active_session', message: 'Check in to see available games.' }, { status: 403 });

    const targetBranch = branchId ?? visit.branchId;
    if (targetBranch !== visit.branchId) {
      return NextResponse.json({ error: 'wrong_branch', message: 'You can only access games at your current check-in location.' }, { status: 403 });
    }

    const games = await getAvailableGames(targetBranch);
    return NextResponse.json({ games });
  }

  // Owner: catalog for their group
  if (session.role === UserRole.RESTAURANT_OWNER || session.role === UserRole.RESTAURANT_STAFF) {
    if (!branchId) return NextResponse.json({ error: 'branchId_required' }, { status: 400 });

    const branch = await prisma.branch.findFirst({
      where: { id: branchId, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
    });
    if (!branch) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const games = await getAvailableGames(branchId);
    return NextResponse.json({ games });
  }

  // Admin: full catalog
  if (session.role === UserRole.PLATFORM_ADMIN) {
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
    };
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true, _count: { select: { gameSessions: true, restaurantGames: true } } },
      }),
      prisma.game.count({ where }),
    ]);
    return NextResponse.json({ games, total, page, limit, pages: Math.ceil(total / limit) });
  }

  return NextResponse.json({ error: 'forbidden' }, { status: 403 });
}
