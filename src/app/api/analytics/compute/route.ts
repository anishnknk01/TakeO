/**
 * POST /api/analytics/compute
 * Admin-only: triggers daily snapshot computation for one or all groups.
 * Designed to be called by a cron job (e.g. Vercel Cron or external scheduler).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import { computeDailySnapshot } from '@/lib/analytics';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const Body = z.object({
  restaurantGroupId: z.string().uuid().optional(),
  date: z.string().datetime().optional(),
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

  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });

  const targetDate = parsed.data.date ? new Date(parsed.data.date) : undefined;

  if (parsed.data.restaurantGroupId) {
    await computeDailySnapshot(parsed.data.restaurantGroupId, targetDate);
    return NextResponse.json({ success: true, computed: 1 });
  }

  // Compute for all groups
  const groups = await prisma.restaurantGroup.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });

  let count = 0;
  for (const g of groups) {
    await computeDailySnapshot(g.id, targetDate);
    count++;
  }

  return NextResponse.json({ success: true, computed: count });
}
