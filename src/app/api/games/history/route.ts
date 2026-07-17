/**
 * GET /api/games/history
 * Returns paginated game history for the authenticated customer.
 * Restaurant owners can filter by branchId.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { getGameHistory } from '@/lib/game';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));

  if (session.role === UserRole.CUSTOMER) {
    const history = await getGameHistory(session.userId, page, limit);
    return NextResponse.json(history);
  }

  if (session.role === UserRole.RESTAURANT_OWNER || session.role === UserRole.RESTAURANT_STAFF) {
    const branchId = searchParams.get('branchId');
    const where = {
      branch: { restaurant: { restaurantGroupId: session.restaurantGroupId! } },
      ...(branchId ? { branchId } : {}),
    };
    const statusFilter = { in: ['COMPLETED', 'ABANDONED', 'INVALID'] as ('COMPLETED' | 'ABANDONED' | 'INVALID')[] };
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      prisma.gameSession.findMany({
        where: { ...where, status: statusFilter },
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        select: {
          id: true, status: true, startedAt: true, completedAt: true,
          durationSecs: true, finalScore: true, pointsAwarded: true, flagReason: true,
          game: { select: { name: true, slug: true } },
          customer: { select: { displayHandle: true } },
          branch: { select: { name: true } },
        },
      }),
      prisma.gameSession.count({ where: { ...where, status: statusFilter } }),
    ]);
    return NextResponse.json({ sessions, total, page, limit, pages: Math.ceil(total / limit) });
  }

  return NextResponse.json({ error: 'forbidden' }, { status: 403 });
}
