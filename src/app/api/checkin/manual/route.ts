/**
 * POST /api/checkin/manual
 * Staff manually checks in a customer by entering a customer code or ID.
 * Requires RESTAURANT_STAFF or RESTAURANT_OWNER role.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createVisit, logCheckInAttempt, CheckInError } from '@/lib/checkin';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const Body = z.object({
  customerId: z.string().uuid(),
  branchId: z.string().uuid(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || (session.role !== UserRole.RESTAURANT_OWNER && session.role !== UserRole.RESTAURANT_STAFF)) {
    return NextResponse.json({ error: 'forbidden', message: 'Staff login required.' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { customerId, branchId } = parsed.data;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // Confirm branch belongs to this owner's group
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
    select: { id: true, restaurant: { select: { restaurantGroupId: true } } },
  });
  if (!branch) {
    return NextResponse.json({ error: 'branch_not_found', message: 'Branch not found.' }, { status: 404 });
  }

  // Confirm customer belongs to this group
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, restaurantGroupId: branch.restaurant.restaurantGroupId, deletedAt: null },
  });
  if (!customer) {
    return NextResponse.json({ error: 'customer_not_found', message: 'Customer not found in this group.' }, { status: 404 });
  }

  let result: Awaited<ReturnType<typeof createVisit>>;
  try {
    result = await createVisit({
      customerId,
      branchId,
      restaurantGroupId: branch.restaurant.restaurantGroupId,
      method: 'STAFF_MANUAL',
      ipAddress,
    });
  } catch (err) {
    const e = err as CheckInError;
    await logCheckInAttempt({ branchId, customerId, method: 'STAFF_MANUAL', success: false, failReason: e.code, ipAddress });
    return NextResponse.json({ error: e.code, message: e.message }, { status: 409 });
  }

  await logCheckInAttempt({ branchId, customerId, method: 'STAFF_MANUAL', success: true, ipAddress, visitId: result.visitId });

  return NextResponse.json({
    success: true,
    visitId: result.visitId,
    expiresAt: result.expiresAt.toISOString(),
  }, { status: 201 });
}
