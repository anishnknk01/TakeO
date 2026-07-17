import { NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { getActiveChallenges } from '@/lib/v2/challenges';
import { UserRole } from '@/types/auth';

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const challenges = await getActiveChallenges(session.userId, session.restaurantGroupId!);
  return NextResponse.json({ challenges });
}
