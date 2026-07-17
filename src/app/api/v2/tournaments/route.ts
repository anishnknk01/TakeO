import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import { getActiveTournaments, joinTournament, getTournamentLeaderboard } from '@/lib/v2/tournaments';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const groupId = session.restaurantGroupId ?? request.nextUrl.searchParams.get('restaurantGroupId');
  if (!groupId) return NextResponse.json({ error: 'restaurantGroupId required' }, { status: 400 });
  const tournaments = await getActiveTournaments(groupId);
  return NextResponse.json({ tournaments });
}

const JoinBody = z.object({ tournamentId: z.string().uuid(), teamId: z.string().uuid().optional() });

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const parsed = JoinBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });
  try {
    const p = await joinTournament(parsed.data.tournamentId, session.userId, parsed.data.teamId);
    return NextResponse.json(p, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
