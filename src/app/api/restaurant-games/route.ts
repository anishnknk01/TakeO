/**
 * GET  /api/restaurant-games?branchId=  — List activated games for a branch
 * POST /api/restaurant-games            — Enable a game for a branch
 * PUT  /api/restaurant-games            — Update game settings (multiplier, limit, featured)
 * DELETE /api/restaurant-games?branchId=&gameId= — Disable a game from a branch
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const ActivateBody = z.object({
  branchId: z.string().uuid(),
  gameId: z.string().uuid(),
  maxPlaysPerDay: z.number().int().min(1).max(100).optional().nullable(),
  scoreMultiplier: z.number().min(0.1).max(10).default(1.0),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

const UpdateBody = ActivateBody.partial().extend({
  branchId: z.string().uuid(),
  gameId: z.string().uuid(),
});

async function ownerBranchGuard(branchId: string, groupId: string) {
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, deletedAt: null, restaurant: { restaurantGroupId: groupId } },
  });
  return !!branch;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || (session.role !== UserRole.RESTAURANT_OWNER && session.role !== UserRole.RESTAURANT_STAFF)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const branchId = request.nextUrl.searchParams.get('branchId');
  if (!branchId) return NextResponse.json({ error: 'branchId required' }, { status: 400 });
  if (!(await ownerBranchGuard(branchId, session.restaurantGroupId!))) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const games = await prisma.restaurantGame.findMany({
    where: { branchId },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    include: {
      game: {
        select: { id: true, name: true, slug: true, thumbnailUrl: true, status: true, difficulty: true, estimatedPlaySecs: true, category: { select: { name: true } } },
      },
    },
  });

  return NextResponse.json({ games });
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

  const parsed = ActivateBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { branchId, gameId, ...rest } = parsed.data;
  if (!(await ownerBranchGuard(branchId, session.restaurantGroupId!))) {
    return NextResponse.json({ error: 'branch_not_found' }, { status: 404 });
  }

  const game = await prisma.game.findFirst({ where: { id: gameId, status: 'ACTIVE', deletedAt: null } });
  if (!game) return NextResponse.json({ error: 'game_not_found_or_inactive' }, { status: 404 });

  const rg = await prisma.restaurantGame.upsert({
    where: { gameId_branchId: { gameId, branchId } },
    create: { gameId, branchId, isActive: true, ...rest },
    update: { isActive: true, ...rest },
    include: { game: true },
  });

  return NextResponse.json(rg, { status: 201 });
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = UpdateBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { branchId, gameId, ...rest } = parsed.data;
  if (!(await ownerBranchGuard(branchId, session.restaurantGroupId!))) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const rg = await prisma.restaurantGame.update({
    where: { gameId_branchId: { gameId, branchId } },
    data: rest,
    include: { game: true },
  });

  return NextResponse.json(rg);
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const branchId = request.nextUrl.searchParams.get('branchId') ?? '';
  const gameId = request.nextUrl.searchParams.get('gameId') ?? '';

  if (!branchId || !gameId) return NextResponse.json({ error: 'branchId and gameId required' }, { status: 400 });
  if (!(await ownerBranchGuard(branchId, session.restaurantGroupId!))) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  await prisma.restaurantGame.update({
    where: { gameId_branchId: { gameId, branchId } },
    data: { isActive: false },
  });

  return new NextResponse(null, { status: 204 });
}
