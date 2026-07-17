/**
 * POST /api/rewards/redeem
 * Restaurant staff redeems a customer's reward via code.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import { redeemReward, RewardError } from '@/lib/rewards';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const Body = z.object({
  redemptionCode: z.string().min(1).max(20),
  branchId: z.string().uuid(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || (session.role !== UserRole.RESTAURANT_OWNER && session.role !== UserRole.RESTAURANT_STAFF)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { redemptionCode, branchId } = parsed.data;

  // Verify branch belongs to staff's group
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
  });
  if (!branch) return NextResponse.json({ error: 'branch_not_found' }, { status: 404 });

  try {
    const result = await redeemReward(redemptionCode.toUpperCase(), session.userId, branchId);
    return NextResponse.json(result);
  } catch (err) {
    const e = err as RewardError;
    const status = e.code === 'not_found' ? 404 : e.code === 'already_redeemed' ? 409 : 400;
    return NextResponse.json({ error: e.code, message: e.message }, { status });
  }
}
