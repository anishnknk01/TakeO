/**
 * POST /api/leaderboard/recalculate
 * Admin-only: recalculates ranks or triggers period resets.
 * Body: { action: 'recalculate' | 'reset_daily' | 'reset_weekly' | 'reset_monthly', restaurantGroupId? }
 *
 * In production this would be called by a cron job. The endpoint is also
 * callable from the admin dashboard for manual resets.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import {
  resetDailyLeaderboards,
  resetWeeklyLeaderboards,
  resetMonthlyLeaderboards,
  recalculateDailyRanks,
  recalculateWeeklyRanks,
  recalculateMonthlyRanks,
  recalculateLifetimeRanks,
  todayUTC,
  thisWeekMonday,
  thisMonthStart,
} from '@/lib/leaderboard';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const Body = z.object({
  action: z.enum(['reset_daily', 'reset_weekly', 'reset_monthly', 'recalculate']),
  restaurantGroupId: z.string().uuid().optional(),
  period: z.enum(['daily', 'weekly', 'monthly', 'lifetime']).optional(),
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

  const { action, restaurantGroupId, period } = parsed.data;

  switch (action) {
    case 'reset_daily': {
      const result = await resetDailyLeaderboards();
      return NextResponse.json({ success: true, ...result });
    }
    case 'reset_weekly': {
      const result = await resetWeeklyLeaderboards();
      return NextResponse.json({ success: true, ...result });
    }
    case 'reset_monthly': {
      const result = await resetMonthlyLeaderboards();
      return NextResponse.json({ success: true, ...result });
    }
    case 'recalculate': {
      if (!restaurantGroupId) return NextResponse.json({ error: 'restaurantGroupId required' }, { status: 400 });
      if (!period) return NextResponse.json({ error: 'period required' }, { status: 400 });

      if (period === 'daily') {
        const lb = await prisma.dailyLeaderboard.findFirst({ where: { restaurantGroupId, date: todayUTC() } });
        if (lb) await recalculateDailyRanks(lb.id);
      } else if (period === 'weekly') {
        const lb = await prisma.weeklyLeaderboard.findFirst({ where: { restaurantGroupId, weekStartDate: thisWeekMonday() } });
        if (lb) await recalculateWeeklyRanks(lb.id);
      } else if (period === 'monthly') {
        const lb = await prisma.monthlyLeaderboard.findFirst({ where: { restaurantGroupId, monthStartDate: thisMonthStart() } });
        if (lb) await recalculateMonthlyRanks(lb.id);
      } else if (period === 'lifetime') {
        const lb = await prisma.lifetimeLeaderboard.findFirst({ where: { restaurantGroupId } });
        if (lb) await recalculateLifetimeRanks(lb.id);
      }
      return NextResponse.json({ success: true });
    }
  }
}
