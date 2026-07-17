/**
 * GET  /api/admin/leaderboard/flags  — List unresolved flags
 * POST /api/admin/leaderboard/flags/resolve — Resolve a flag
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { resolveLeaderboardFlag, removeCustomerFromLeaderboards } from '@/lib/leaderboard';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.PLATFORM_ADMIN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const resolved = searchParams.get('resolved') === 'true';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = { isResolved: resolved };
  const [flags, total] = await Promise.all([
    prisma.leaderboardFlag.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, reason: true, details: true, isResolved: true, createdAt: true, resolvedAt: true,
        customerId: true,
        customer: { select: { displayHandle: true } },
        restaurantGroupId: true,
      },
    }),
    prisma.leaderboardFlag.count({ where }),
  ]);

  return NextResponse.json({ flags, total, page, limit, pages: Math.ceil(total / limit) });
}

const ResolveBody = z.object({
  flagId: z.string().uuid(),
  action: z.enum(['dismiss', 'remove_entries']),
  restaurantGroupId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.PLATFORM_ADMIN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = ResolveBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });

  const { flagId, action, restaurantGroupId, customerId } = parsed.data;

  if (action === 'remove_entries' && restaurantGroupId && customerId) {
    await removeCustomerFromLeaderboards(customerId, restaurantGroupId);
  }

  await resolveLeaderboardFlag(flagId, session.userId);
  return NextResponse.json({ success: true });
}
