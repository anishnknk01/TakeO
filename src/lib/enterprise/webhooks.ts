/**
 * Enterprise: Webhook delivery system.
 * Delivers event payloads to registered endpoints with HMAC-SHA256 signatures.
 */
import 'server-only';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';

export async function deliverWebhook(opts: {
  restaurantGroupId: string;
  event: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { restaurantGroupId: opts.restaurantGroupId, isActive: true },
  });

  for (const endpoint of endpoints) {
    const events = endpoint.events as string[];
    if (events.length > 0 && !events.includes(opts.event) && !events.includes('*')) continue;

    const body = JSON.stringify({ event: opts.event, data: opts.payload, timestamp: new Date().toISOString() });
    const signature = createHmac('sha256', endpoint.secret).update(body).digest('hex');

    let success = false;
    let httpStatus: number | null = null;
    let responseText: string | null = null;

    try {
      const res = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PlayBite-Signature': `sha256=${signature}`,
          'X-PlayBite-Event': opts.event,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });
      httpStatus = res.status;
      responseText = await res.text().catch(() => null);
      success = res.ok;
    } catch (err) {
      responseText = (err as Error).message;
    }

    await prisma.webhookDelivery.create({
      data: {
        endpointId: endpoint.id,
        event: opts.event,
        payload: opts.payload as object,
        httpStatus,
        response: responseText?.slice(0, 1000) ?? null,
        success,
      },
    });

    if (!success) {
      await prisma.webhookEndpoint.update({
        where: { id: endpoint.id },
        data: { failCount: { increment: 1 } },
      });
    } else {
      await prisma.webhookEndpoint.update({
        where: { id: endpoint.id },
        data: { lastDeliveryAt: new Date(), failCount: 0 },
      });
    }
  }
}

export async function registerWebhookEndpoint(opts: {
  restaurantGroupId: string;
  url: string;
  events: string[];
  secret: string;
}) {
  return prisma.webhookEndpoint.create({ data: opts });
}
