import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const staff = await prisma.restaurantStaff.findFirst({
    where: { id, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
    include: { branchAssignments: { include: { branch: { select: { id: true, name: true } } } } },
  });
  if (!staff) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(staff);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const staff = await prisma.restaurantStaff.findFirst({
    where: { id, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
  });
  if (!staff) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await prisma.restaurantStaff.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  return new NextResponse(null, { status: 204 });
}
