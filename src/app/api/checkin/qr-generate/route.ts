/**
 * POST /api/checkin/qr-generate
 * Restaurant owner generates/regenerates a QR token for a branch.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateQrToken } from '@/lib/checkin';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const Body = z.object({
  branchId: z.string().uuid(),
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

  const { branchId } = parsed.data;

  // Ownership check
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, deletedAt: null, isActive: true, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
    include: { restaurant: { include: { settings: true } } },
  });
  if (!branch) return NextResponse.json({ error: 'branch_not_found' }, { status: 404 });

  const ttl = branch.restaurant.settings?.qrRotationMinutes ?? 60;
  const { token, expiresAt, qrCodeId } = await generateQrToken(branchId, session.restaurantGroupId!, ttl);

  return NextResponse.json({ token, expiresAt: expiresAt.toISOString(), qrCodeId });
}
