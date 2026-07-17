/**
 * GET /api/leaderboard/daily?restaurantGroupId=&branchId=&topN=
 * Returns the daily leaderboard for a group/branch.
 * Customers see their own entry included. Rate-limited by auth.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { getDailyLeaderboard } from '@/lib/leaderboard';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const topN = Math.min(100, parseInt(searchParams.get('topN') ?? '10', 10));

  let restaurantGroupId: string;
  let branchId: string | null = null;

  if (session.role === UserRole.CUSTOMER) {
    restaurantGroupId = session.restaurantGroupId!;
  } else {
    restaurantGroupId = searchParams.get('restaurantGroupId') ?? session.restaurantGroupId!;
    branchId = searchParams.get('branchId') ?? null;
  }

  const result = await getDailyLeaderboard(restaurantGroupId, branchId, session.userId, topN);
  if (!result) return NextResponse.json({ leaderboard: null });
  return NextResponse.json({ leaderboard: result });
}
