/**
 * GET  /api/enterprise/webhooks — List webhook endpoints
 * POST /api/enterprise/webhooks — Register a new endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { getSessionPayload } from '@/lib/session';
import { registerWebhookEndpoint } from '@/lib/enterprise/webhooks';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const CreateBody = z.object({
  url: z.string().url(),
  events: z.array(z.string()).default(['*']),
});

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { restaurantGroupId: session.restaurantGroupId!, isActive: true },
    select: { id: true, url: true, events: true, isActive: true, lastDeliveryAt: true, failCount: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ endpoints });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });

  const secret = `whsec_${randomBytes(24).toString('hex')}`;
  const endpoint = await registerWebhookEndpoint({
    restaurantGroupId: session.restaurantGroupId!,
    url: parsed.data.url,
    events: parsed.data.events,
    secret,
  });

  return NextResponse.json({ id: endpoint.id, secret }, { status: 201 });
}
