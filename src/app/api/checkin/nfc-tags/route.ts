/**
 * GET /api/checkin/nfc-tags?branchId=
 * Lists NFC tags for a branch (owner only).
 *
 * DELETE /api/checkin/nfc-tags?tagId=
 * Deactivates an NFC tag.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const branchId = request.nextUrl.searchParams.get('branchId');
  if (!branchId) return NextResponse.json({ error: 'branchId required' }, { status: 400 });

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
  });
  if (!branch) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const tags = await prisma.restaurantNFCTag.findMany({
    where: { branchId },
    select: { id: true, label: true, isActive: true, registeredAt: true, lastUsedAt: true },
    orderBy: { registeredAt: 'desc' },
  });

  return NextResponse.json({ tags });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const tagId = request.nextUrl.searchParams.get('tagId');
  if (!tagId) return NextResponse.json({ error: 'tagId required' }, { status: 400 });

  const tag = await prisma.restaurantNFCTag.findFirst({
    where: { id: tagId, branch: { restaurant: { restaurantGroupId: session.restaurantGroupId! } } },
  });
  if (!tag) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await prisma.restaurantNFCTag.update({ where: { id: tagId }, data: { isActive: false } });
  return new NextResponse(null, { status: 204 });
}
