import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const UpdateBody = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().nullable(),
});

/**
 * GET /api/restaurants/[id]
 */
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
      : { id, restaurantGroupId: session.restaurantGroupId!, deletedAt: null };

  const restaurant = await prisma.restaurant.findFirst({
    where,
    include: {
      branches: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' } },
      settings: true,
    },
  });
  if (!restaurant) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(restaurant);
}

/**
 * PATCH /api/restaurants/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: { id, restaurantGroupId: session.restaurantGroupId!, deletedAt: null },
  });
  if (!restaurant) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const parsed = UpdateBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });

  if (parsed.data.name && parsed.data.name !== restaurant.name) {
    const clash = await prisma.restaurant.findFirst({
      where: { name: parsed.data.name, restaurantGroupId: session.restaurantGroupId!, deletedAt: null, id: { not: id } },
    });
    if (clash) return NextResponse.json({ error: 'duplicate_name' }, { status: 409 });
  }

  const updated = await prisma.restaurant.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

/**
 * DELETE /api/restaurants/[id]  (soft delete)
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: { id, restaurantGroupId: session.restaurantGroupId!, deletedAt: null },
    include: { branches: { where: { deletedAt: null } } },
  });
  if (!restaurant) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (restaurant.branches.length > 0) {
    return NextResponse.json({ error: 'has_active_branches' }, { status: 409 });
  }

  await prisma.restaurant.update({ where: { id }, data: { deletedAt: new Date() } });
  return new NextResponse(null, { status: 204 });
}
