import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const CreateBody = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
});

/**
 * GET /api/restaurants
 * Returns restaurants owned by the current owner, or all for admin.
 * Supports ?page=&limit=&search= query params.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
  const search = searchParams.get('search') ?? '';
  const skip = (page - 1) * limit;

  const where =
    session.role === UserRole.PLATFORM_ADMIN
      ? { deletedAt: null, ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}) }
      : { restaurantGroupId: session.restaurantGroupId!, deletedAt: null,
          ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}) };

  const [items, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, description: true, logoUrl: true,
        createdAt: true, restaurantGroupId: true,
        _count: { select: { branches: { where: { deletedAt: null } } } },
      },
    }),
    prisma.restaurant.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

/**
 * POST /api/restaurants
 * Creates a new restaurant in the current owner's group.
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

  const existing = await prisma.restaurant.findFirst({
    where: { name: parsed.data.name, restaurantGroupId: session.restaurantGroupId!, deletedAt: null },
  });
  if (existing) return NextResponse.json({ error: 'duplicate_name' }, { status: 409 });

  const restaurant = await prisma.restaurant.create({
    data: { ...parsed.data, restaurantGroupId: session.restaurantGroupId! },
  });

  return NextResponse.json(restaurant, { status: 201 });
}
