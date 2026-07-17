import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const CreateBody = z.object({
  restaurantId: z.string().uuid(),
  name: z.string().min(2).max(100),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  country: z.string().length(2).default('US'),
  timezone: z.string().default('UTC'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

/**
 * GET /api/branches
 * Returns branches for the current owner's group, or all for admin.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const restaurantId = searchParams.get('restaurantId');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
  const search = searchParams.get('search') ?? '';
  const skip = (page - 1) * limit;

  const groupFilter =
    session.role === UserRole.PLATFORM_ADMIN
      ? {}
      : { restaurant: { restaurantGroupId: session.restaurantGroupId! } };

  const where = {
    deletedAt: null,
    ...groupFilter,
    ...(restaurantId ? { restaurantId } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.branch.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, address: true, city: true, country: true,
        timezone: true, isActive: true, createdAt: true, restaurantId: true,
        restaurant: { select: { name: true } },
        _count: { select: { staffAssignments: true } },
      },
    }),
    prisma.branch.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

/**
 * POST /api/branches
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });

  const restaurant = await prisma.restaurant.findFirst({
    where: { id: parsed.data.restaurantId, restaurantGroupId: session.restaurantGroupId!, deletedAt: null },
  });
  if (!restaurant) return NextResponse.json({ error: 'restaurant_not_found' }, { status: 404 });

  const existing = await prisma.branch.findFirst({
    where: { name: parsed.data.name, restaurantId: parsed.data.restaurantId, deletedAt: null },
  });
  if (existing) return NextResponse.json({ error: 'duplicate_name' }, { status: 409 });

  const branch = await prisma.branch.create({ data: parsed.data });
  return NextResponse.json(branch, { status: 201 });
}
