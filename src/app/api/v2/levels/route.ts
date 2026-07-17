import { NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { getCustomerLevel } from '@/lib/v2/levels';
import { UserRole } from '@/types/auth';

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const level = await getCustomerLevel(session.userId, session.restaurantGroupId!);
  return NextResponse.json(level);
}
