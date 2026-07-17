import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const UpdateBody = z.object({
  name: z.string().min(2).max(100).optional(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().length(2).optional(),
  timezone: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const where =
    session.role === UserRole.PLATFORM_ADMIN
      ? { id, deletedAt: null }
      : { id, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } };

  const branch = await prisma.branch.findFirst({
    where,
    include: {
      restaurant: { select: { id: true, name: true } },
      staffAssignments: { include: { staff: { select: { id: true, name: true, email: true, isActive: true } } } },
    },
  });
  if (!branch) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(branch);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const branch = await prisma.branch.findFirst({
    where: { id, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
  });
  if (!branch) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const parsed = UpdateBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });

  const updated = await prisma.branch.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
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

  const branch = await prisma.branch.findFirst({
    where: { id, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
  });
  if (!branch) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await prisma.branch.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  return new NextResponse(null, { status: 204 });
}
