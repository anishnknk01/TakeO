/**
 * GET  /api/enterprise/integrations — List configured integrations
 * POST /api/enterprise/integrations — Configure a new integration
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const CreateBody = z.object({
  type: z.enum(['POS', 'CRM', 'ERP', 'MARKETING', 'PAYMENT', 'CUSTOM']),
  provider: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const integrations = await prisma.integration.findMany({
    where: { restaurantGroupId: session.restaurantGroupId! },
    select: { id: true, type: true, provider: true, name: true, isActive: true, lastSyncAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ integrations });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });

  const integration = await prisma.integration.upsert({
    where: {
      restaurantGroupId_type_provider: {
        restaurantGroupId: session.restaurantGroupId!,
        type: parsed.data.type,
        provider: parsed.data.provider,
      },
    },
    create: {
      type: parsed.data.type,
      provider: parsed.data.provider,
      name: parsed.data.name,
      config: parsed.data.config ? (parsed.data.config as object) : undefined,
      restaurantGroup: { connect: { id: session.restaurantGroupId! } },
    },
    update: { name: parsed.data.name, config: parsed.data.config ? (parsed.data.config as object) : undefined },
  });

  return NextResponse.json(integration, { status: 201 });
}
