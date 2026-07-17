/**
 * GET /api/games/personal-bests
 * Returns all personal best scores for the authenticated customer.
 */
import { NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { getPersonalBests } from '@/lib/game';
import { UserRole } from '@/types/auth';

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const personalBests = await getPersonalBests(session.userId);
  return NextResponse.json({ personalBests });
}
