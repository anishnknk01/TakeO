import { NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { getRewardWallet } from '@/lib/rewards';
import { UserRole } from '@/types/auth';

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const wallet = await getRewardWallet(session.userId);
  return NextResponse.json(wallet);
}
