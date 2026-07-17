/**
 * POST /api/checkin/qr
 * Customer presents a scanned QR token. Server validates it, creates a visit,
 * and returns session info. Requires the customer to be authenticated first.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateQrToken,
  consumeQrToken,
  createVisit,
  logCheckInAttempt,
  checkRateLimit,
  recordRateLimitHit,
  CheckInError,
} from '@/lib/checkin';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const Body = z.object({
  /** The full signed JWT token from the QR code */
  token: z.string().min(10),
  /** Client-computed device fingerprint hash */
  deviceHash: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // Rate limit check
  if (!(await checkRateLimit(ipAddress))) {
    return NextResponse.json({ error: 'rate_limited', message: 'Too many check-in attempts.' }, { status: 429 });
  }
  await recordRateLimitHit(ipAddress);

  // Auth check
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

  const { token, deviceHash } = parsed.data;
  const customerId = session.userId;

  // Validate QR token
  let qrPayload: Awaited<ReturnType<typeof validateQrToken>>;
  try {
    qrPayload = await validateQrToken(token);
  } catch (err) {
    const e = err as CheckInError;
    await logCheckInAttempt({ branchId: 'unknown', customerId, method: 'QR_CODE', success: false, failReason: e.code, deviceHash, ipAddress });
    return NextResponse.json({ error: e.code, message: e.message }, { status: 400 });
  }

  // Verify the QR's restaurant group matches the customer's group
  if (qrPayload.restaurantGroupId !== session.restaurantGroupId) {
    await logCheckInAttempt({ branchId: qrPayload.branchId, customerId, method: 'QR_CODE', success: false, failReason: 'wrong_group', deviceHash, ipAddress });
    return NextResponse.json({ error: 'wrong_group', message: 'This QR code is for a different restaurant.' }, { status: 403 });
  }

  // Create visit
  let result: Awaited<ReturnType<typeof createVisit>>;
  try {
    result = await createVisit({
      customerId,
      branchId: qrPayload.branchId,
      restaurantGroupId: qrPayload.restaurantGroupId,
      method: 'QR_CODE',
      artifactHash: qrPayload.jti,
      deviceHash,
      ipAddress,
    });
  } catch (err) {
    const e = err as CheckInError;
    await logCheckInAttempt({ branchId: qrPayload.branchId, customerId, method: 'QR_CODE', success: false, failReason: e.code, deviceHash, ipAddress });
    return NextResponse.json({ error: e.code, message: e.message }, { status: 409 });
  }

  // Mark QR token as consumed (single-use)
  await consumeQrToken(qrPayload.qrCodeId);

  await logCheckInAttempt({ branchId: qrPayload.branchId, customerId, method: 'QR_CODE', success: true, deviceHash, ipAddress, visitId: result.visitId });

  return NextResponse.json({
    success: true,
    visitId: result.visitId,
    branchId: qrPayload.branchId,
    expiresAt: result.expiresAt.toISOString(),
  }, { status: 201 });
}
