/**
 * POST /api/games/start
 * Customer starts a game. Requires active check-in session.
 * Returns a signed nonce JWT and game metadata.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { startGameSession, GameError } from '@/lib/game';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const Body = z.object({
  gameId: z.string().uuid(),
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

  try {
    const result = await startGameSession(session.userId, parsed.data.gameId);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const e = err as GameError;
    const status = e.code === 'no_active_session' ? 403 : e.code === 'daily_limit_reached' ? 429 : 400;
    return NextResponse.json({ error: e.code, message: e.message }, { status });
  }
}
