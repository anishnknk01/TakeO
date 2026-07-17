/**
 * GET  /api/rewards — List rewards for a group (owner/admin)
 * POST /api/rewards — Create a reward (owner)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const CreateBody = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['DISCOUNT_PERCENT', 'DISCOUNT_FIXED', 'FREE_ITEM', 'BUY_ONE_GET_ONE', 'SPIN_WHEEL', 'BADGE', 'POINTS_MULTIPLIER', 'CASHBACK', 'GIFT_VOUCHER', 'MYSTERY']),
  value: z.number().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  inventory: z.number().int().min(0).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
  const skip = (page - 1) * limit;

  let groupId: string;
  if (session.role === UserRole.PLATFORM_ADMIN) {
    groupId = searchParams.get('restaurantGroupId') ?? '';
    if (!groupId) {
      const items = await prisma.reward.findMany({
        skip, take: limit, orderBy: { createdAt: 'desc' },
        where: { deletedAt: null },
        select: { id: true, name: true, type: true, value: true, inventory: true, isActive: true, createdAt: true, restaurantGroupId: true },
      });
      const total = await prisma.reward.count({ where: { deletedAt: null } });
      return NextResponse.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
    }
  } else {
    groupId = session.restaurantGroupId!;
  }

  const where = { restaurantGroupId: groupId, deletedAt: null };
  const [items, total] = await Promise.all([
    prisma.reward.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.reward.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });

  const reward = await prisma.reward.create({
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      restaurantGroupId: session.restaurantGroupId!,
    },
  });

  return NextResponse.json(reward, { status: 201 });
}
