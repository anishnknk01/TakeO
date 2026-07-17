/**
 * GET  /api/enterprise/api-keys — List API keys
 * POST /api/enterprise/api-keys — Create a new API key
 * DELETE /api/enterprise/api-keys?id= — Revoke an API key
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import { createApiKey, listApiKeys, revokeApiKey } from '@/lib/enterprise/api-keys';
import { UserRole } from '@/types/auth';

const CreateBody = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const keys = await listApiKeys(session.restaurantGroupId!);
  return NextResponse.json({ keys });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });

  const expiresAt = parsed.data.expiresInDays ? new Date(Date.now() + parsed.data.expiresInDays * 86400000) : undefined;
  const result = await createApiKey({
    restaurantGroupId: session.restaurantGroupId!,
    name: parsed.data.name,
    scopes: parsed.data.scopes,
    expiresAt,
  });

  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await revokeApiKey(id, session.restaurantGroupId!);
  return new NextResponse(null, { status: 204 });
}
