import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import { getMarketplaceItems, installMarketplaceItem } from '@/lib/v2/marketplace';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { searchParams } = request.nextUrl;
  const result = await getMarketplaceItems({
    type: searchParams.get('type') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    page: parseInt(searchParams.get('page') ?? '1', 10),
  });
  return NextResponse.json(result);
}

const InstallBody = z.object({ itemId: z.string().uuid() });

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const parsed = InstallBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });
  try {
    await installMarketplaceItem(parsed.data.itemId, session.restaurantGroupId!);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
