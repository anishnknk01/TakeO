/**
 * POST /api/games/score
 * Submits a game score. Server-validates against nonce, anti-cheat rules.
 * Returns points awarded and personal best flag.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { submitGameScore, GameError } from '@/lib/game';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const Body = z.object({
  gameSessionId: z.string().uuid(),
  /** Full nonce JWT returned from /api/games/start */
  nonce: z.string().min(10),
  /** Raw score from the game client */
  score: z.number().int().min(0),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { gameSessionId, nonce, score } = parsed.data;

  try {
    const result = await submitGameScore(gameSessionId, session.userId, nonce, score);
    return NextResponse.json(result);
  } catch (err) {
    const e = err as GameError;
    const status = e.code === 'nonce_invalid' || e.code === 'nonce_mismatch' ? 401 : 400;
    return NextResponse.json({ error: e.code, message: e.message }, { status });
  }
}
