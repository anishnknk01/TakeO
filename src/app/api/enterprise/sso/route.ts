/**
 * GET  /api/enterprise/sso — List SSO configurations
 * POST /api/enterprise/sso — Configure SSO for a group
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const CreateBody = z.object({
  provider: z.enum(['SAML', 'OAUTH', 'OIDC']),
  metadataUrl: z.string().url().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  issuer: z.string().optional(),
  callbackUrl: z.string().url().optional(),
});

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const configs = await prisma.sSOConfig.findMany({
    where: { restaurantGroupId: session.restaurantGroupId! },
    select: { id: true, provider: true, metadataUrl: true, clientId: true, issuer: true, callbackUrl: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ configs });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });

  const config = await prisma.sSOConfig.upsert({
    where: { restaurantGroupId_provider: { restaurantGroupId: session.restaurantGroupId!, provider: parsed.data.provider } },
    create: { ...parsed.data, restaurantGroupId: session.restaurantGroupId! },
    update: parsed.data,
  });

  return NextResponse.json({ id: config.id }, { status: 201 });
}
