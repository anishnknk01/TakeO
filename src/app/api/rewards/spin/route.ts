import { NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { executeSpin, canCustomerSpin, RewardError } from '@/lib/rewards';
import { UserRole } from '@/types/auth';

/** GET — check if customer can spin */
export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const result = await canCustomerSpin(session.userId, session.restaurantGroupId!);
  return NextResponse.json(result);
}

/** POST — execute spin */
export async function POST(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  try {
    const result = await executeSpin(session.userId, session.restaurantGroupId!);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const e = err as RewardError;
    const status = e.code === 'no_active_session' ? 403 : e.code === 'already_spun' || e.code === 'daily_limit' ? 429 : 400;
    return NextResponse.json({ error: e.code, message: e.message }, { status });
  }
}
