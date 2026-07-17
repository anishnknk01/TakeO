import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import { generateReferralCode, redeemReferralCode } from '@/lib/v2/referrals';
import { UserRole } from '@/types/auth';

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const code = await generateReferralCode(session.userId, session.restaurantGroupId!);
  return NextResponse.json({ code });
}

const RedeemBody = z.object({ code: z.string().min(1) });

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const parsed = RedeemBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });
  const result = await redeemReferralCode(parsed.data.code, session.userId);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true });
}
