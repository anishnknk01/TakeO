/**
 * GET /api/leaderboard/me
 * Returns the current customer's ranks across all active leaderboard periods.
 */
import { NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { getMyRanks } from '@/lib/leaderboard';
import { UserRole } from '@/types/auth';

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const ranks = await getMyRanks(session.userId, session.restaurantGroupId!);
  return NextResponse.json({ ranks });
}
