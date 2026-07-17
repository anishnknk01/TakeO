/**
 * PATCH /api/admin/games/[id]  — Update game (admin only)
 * DELETE /api/admin/games/[id] — Soft-delete game (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const UpdateBody = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  bundleUrl: z.string().url().optional(),
  version: z.string().optional(),
  status: z.enum(['PENDING_REVIEW', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  estimatedPlaySecs: z.number().int().min(5).max(600).optional(),
  maxScore: z.number().int().min(1).optional(),
  minDurationSecs: z.number().int().min(1).optional(),
  pointsPerScore: z.number().min(0.01).max(100).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.PLATFORM_ADMIN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const game = await prisma.game.findFirst({ where: { id, deletedAt: null } });
  if (!game) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = UpdateBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const updated = await prisma.game.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.PLATFORM_ADMIN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const game = await prisma.game.findFirst({ where: { id, deletedAt: null } });
  if (!game) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await prisma.game.update({ where: { id }, data: { deletedAt: new Date(), status: 'ARCHIVED' } });
  return new NextResponse(null, { status: 204 });
}
