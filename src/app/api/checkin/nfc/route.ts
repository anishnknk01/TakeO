/**
 * POST /api/checkin/nfc
 * Customer taps NFC tag. Server validates the UID, creates a visit.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateNfcTag,
  createVisit,
  logCheckInAttempt,
  checkRateLimit,
  recordRateLimitHit,
  CheckInError,
} from '@/lib/checkin';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const Body = z.object({
  /** Raw NFC tag UID read from the device */
  uid: z.string().min(1),
  deviceHash: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!(await checkRateLimit(ipAddress))) {
    return NextResponse.json({ error: 'rate_limited', message: 'Too many check-in attempts.' }, { status: 429 });
  }
  await recordRateLimitHit(ipAddress);

  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) {
    return NextResponse.json({ error: 'unauthenticated', message: 'Login required before checking in.' }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { uid, deviceHash } = parsed.data;
  const customerId = session.userId;

  let tagPayload: Awaited<ReturnType<typeof validateNfcTag>>;
  try {
    tagPayload = await validateNfcTag(uid);
  } catch (err) {
    const e = err as CheckInError;
    await logCheckInAttempt({ branchId: 'unknown', customerId, method: 'NFC_TAG', success: false, failReason: e.code, deviceHash, ipAddress });
    return NextResponse.json({ error: e.code, message: e.message }, { status: 400 });
  }

  // Check the branch's restaurant group matches the customer
  const branch = await prisma.branch.findFirst({
    where: { id: tagPayload.branchId },
    select: { restaurant: { select: { restaurantGroupId: true } } },
  });
  const restaurantGroupId = branch?.restaurant.restaurantGroupId;

  if (!restaurantGroupId || restaurantGroupId !== session.restaurantGroupId) {
    await logCheckInAttempt({ branchId: tagPayload.branchId, customerId, method: 'NFC_TAG', success: false, failReason: 'wrong_group', deviceHash, ipAddress });
    return NextResponse.json({ error: 'wrong_group', message: 'This NFC tag belongs to a different restaurant.' }, { status: 403 });
  }

  let result: Awaited<ReturnType<typeof createVisit>>;
  try {
    result = await createVisit({
      customerId,
      branchId: tagPayload.branchId,
      restaurantGroupId,
      method: 'NFC_TAG',
      artifactHash: tagPayload.tagId,
      deviceHash,
      ipAddress,
    });
  } catch (err) {
    const e = err as CheckInError;
    await logCheckInAttempt({ branchId: tagPayload.branchId, customerId, method: 'NFC_TAG', success: false, failReason: e.code, deviceHash, ipAddress });
    return NextResponse.json({ error: e.code, message: e.message }, { status: 409 });
  }

  await logCheckInAttempt({ branchId: tagPayload.branchId, customerId, method: 'NFC_TAG', success: true, deviceHash, ipAddress, visitId: result.visitId });

  return NextResponse.json({
    success: true,
    visitId: result.visitId,
    branchId: tagPayload.branchId,
    expiresAt: result.expiresAt.toISOString(),
  }, { status: 201 });
}
