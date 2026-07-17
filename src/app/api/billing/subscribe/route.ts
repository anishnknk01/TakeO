/**
 * POST /api/billing/subscribe
 * Creates or upgrades a subscription for a restaurant group.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import { createSubscription, changePlan } from '@/lib/billing';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const Body = z.object({
  planId: z.string().uuid(),
  couponCode: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });

  const { planId, couponCode } = parsed.data;
  const groupId = session.restaurantGroupId!;

  // Check if already subscribed — if so, change plan
  const existing = await prisma.subscription.findFirst({
    where: { restaurantGroupId: groupId, status: { in: ['ACTIVE', 'TRIALING'] } },
  });

  if (existing) {
    try {
      await changePlan(groupId, planId);
      return NextResponse.json({ success: true, action: 'plan_changed' });
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
  }

  // Get owner email
  const owner = await prisma.restaurantOwner.findFirst({ where: { restaurantGroupId: groupId, deletedAt: null }, select: { email: true } });

  try {
    const result = await createSubscription({
      restaurantGroupId: groupId,
      planId,
      ownerEmail: owner?.email ?? 'unknown@playbite.io',
      couponCode,
    });
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
