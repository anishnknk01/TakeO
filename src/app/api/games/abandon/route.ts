/**
 * POST /api/games/abandon
 * Marks a started game session as abandoned (customer left mid-game).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { abandonGameSession } from '@/lib/game';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

const Body = z.object({ gameSessionId: z.string().uuid() });

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
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });

  await abandonGameSession(parsed.data.gameSessionId, session.userId);
  return NextResponse.json({ success: true });
}
