import { NextRequest, NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { getLifetimeLeaderboard } from '@/lib/leaderboard';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const topN = Math.min(100, parseInt(searchParams.get('topN') ?? '10', 10));
  const restaurantGroupId =
    session.role === UserRole.CUSTOMER
      ? session.restaurantGroupId!
      : (searchParams.get('restaurantGroupId') ?? session.restaurantGroupId!);

  const result = await getLifetimeLeaderboard(restaurantGroupId, session.userId, topN);
  return NextResponse.json({ leaderboard: result ?? null });
}
