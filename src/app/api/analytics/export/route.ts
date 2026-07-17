/**
 * GET /api/analytics/export?format=csv&type=daily&days=30
 * Exports analytics data as CSV.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { getDailyTrend, toCsv } from '@/lib/analytics';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || (session.role !== UserRole.RESTAURANT_OWNER && session.role !== UserRole.PLATFORM_ADMIN)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const days = Math.min(365, parseInt(searchParams.get('days') ?? '30', 10));
  const groupId = session.restaurantGroupId ?? searchParams.get('restaurantGroupId');

  if (!groupId) return NextResponse.json({ error: 'restaurantGroupId required' }, { status: 400 });

  const trend = await getDailyTrend(groupId, days);
  const csv = toCsv(trend.map((t) => ({
    date: t.date.toISOString().split('T')[0],
    visits: t.totalVisits,
    uniqueCustomers: t.uniqueCustomers,
    gamePlays: t.totalGamePlays,
    rewardsIssued: t.totalRewardsIssued,
    rewardsRedeemed: t.totalRewardsRedeemed,
    spins: t.totalSpins,
  })));

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="playbite-analytics-${days}d.csv"`,
    },
  });
}
