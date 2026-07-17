import { NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { getCustomerAchievements } from '@/lib/v2/achievements';
import { UserRole } from '@/types/auth';

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const achievements = await getCustomerAchievements(session.userId, session.restaurantGroupId!);
  return NextResponse.json({ achievements });
}
