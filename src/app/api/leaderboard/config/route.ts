/**
 * PUT /api/leaderboard/config
 * Restaurant owner updates leaderboard configuration for their group.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const Body = z.object({
  restaurantGroupId: z.string().uuid(),
  chainWideEnabled: z.boolean().default(false),
  dailyEnabled: z.boolean().default(true),
  weeklyEnabled: z.boolean().default(true),
  monthlyEnabled: z.boolean().default(true),
  lifetimeEnabled: z.boolean().default(true),
  displayTopN: z.number().int().min(3).max(100).default(10),
});

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });

  if (parsed.data.restaurantGroupId !== session.restaurantGroupId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { restaurantGroupId, ...data } = parsed.data;
  const config = await prisma.leaderboardConfig.upsert({
    where: { restaurantGroupId },
    create: { restaurantGroupId, ...data },
    update: data,
  });

  return NextResponse.json(config);
}
