/**
 * GET /api/analytics/dashboard?restaurantGroupId=
 * Returns real-time dashboard overview metrics.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { getRestaurantDashboard, getCustomerAnalytics, getRewardAnalytics, getDailyTrend, getPlatformOverview } from '@/lib/analytics';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { searchParams } = request.nextUrl;

  if (session.role === UserRole.PLATFORM_ADMIN) {
    const platform = await getPlatformOverview();
    return NextResponse.json({ platform });
  }

  const groupId = session.restaurantGroupId ?? searchParams.get('restaurantGroupId');
  if (!groupId) return NextResponse.json({ error: 'restaurantGroupId required' }, { status: 400 });

  const days = Math.min(90, parseInt(searchParams.get('days') ?? '7', 10));

  const [overview, customers, rewards, trend] = await Promise.all([
    getRestaurantDashboard(groupId),
    getCustomerAnalytics(groupId),
    getRewardAnalytics(groupId),
    getDailyTrend(groupId, days),
  ]);

  return NextResponse.json({ overview, customers, rewards, trend });
}
