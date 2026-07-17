import { NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { getActiveLuckyHour } from '@/lib/v2/lucky-hours';

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || !session.restaurantGroupId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const luckyHour = await getActiveLuckyHour(session.restaurantGroupId);
  return NextResponse.json({ luckyHour });
}
