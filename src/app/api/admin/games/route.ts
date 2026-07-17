/**
 * POST /api/admin/games  — Create a new game (admin only)
 * GET  /api/admin/games  — List all games in the catalog (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const CreateBody = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  thumbnailUrl: z.string().url().optional(),
  bundleUrl: z.string().url(),
  version: z.string().default('1.0.0'),
  categoryId: z.string().uuid(),
  difficulty: z.number().int().min(1).max(5).default(2),
  estimatedPlaySecs: z.number().int().min(5).max(600).default(60),
  maxScore: z.number().int().min(1).default(10000),
  minDurationSecs: z.number().int().min(1).default(5),
  pointsPerScore: z.number().min(0.01).max(100).default(1),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.PLATFORM_ADMIN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status');
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, type: true } },
        _count: { select: { gameSessions: true, restaurantGames: true } },
      },
    }),
    prisma.game.count({ where }),
  ]);

  return NextResponse.json({ games, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.PLATFORM_ADMIN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const existing = await prisma.game.findFirst({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: 'duplicate_slug' }, { status: 409 });

  const category = await prisma.gameCategory.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return NextResponse.json({ error: 'category_not_found' }, { status: 404 });

  const game = await prisma.game.create({
    data: { ...parsed.data, status: 'PENDING_REVIEW' },
    include: { category: true },
  });

  return NextResponse.json(game, { status: 201 });
}
