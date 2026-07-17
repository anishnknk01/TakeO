/**
 * POST /api/checkin/nfc-register
 * Restaurant owner registers a new NFC tag to a branch.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { registerNfcTag, CheckInError } from '@/lib/checkin';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const Body = z.object({
  branchId: z.string().uuid(),
  uid: z.string().min(4, 'NFC UID is too short').max(64),
  label: z.string().max(100).optional(),
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
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { branchId, uid, label } = parsed.data;

  // Ownership check
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
  });
  if (!branch) return NextResponse.json({ error: 'branch_not_found' }, { status: 404 });

  try {
    const tagId = await registerNfcTag(branchId, uid, label);
    return NextResponse.json({ tagId }, { status: 201 });
  } catch (err) {
    const e = err as CheckInError;
    return NextResponse.json({ error: e.code, message: e.message }, { status: 409 });
  }
}
