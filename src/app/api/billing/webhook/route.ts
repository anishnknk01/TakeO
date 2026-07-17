/**
 * POST /api/billing/webhook
 * Generic payment provider webhook endpoint.
 * In production, verify the signature before processing.
 * This is the entry point for all async payment events.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // In production: validate webhook signature from headers
  // const signature = request.headers.get('stripe-signature') ?? request.headers.get('x-razorpay-signature');
  // if (!verifyWebhookSignature(signature, body)) return NextResponse.json({error: 'invalid_signature'}, {status: 400});

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const eventType = (body.type ?? body.event) as string;
  const externalId = (body.externalId ?? body.id) as string;

  // Log the event
  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'PaymentWebhook',
      entityId: externalId,
      note: `Webhook: ${eventType}`,
      diff: body as object,
    },
  }).catch(() => null);

  // Handle common events
  if (eventType === 'invoice.paid' || eventType === 'payment.captured') {
    const subscriptionExternalId = (body.subscription ?? body.subscriptionId) as string;
    if (subscriptionExternalId) {
      await prisma.subscription.updateMany({
        where: { externalId: subscriptionExternalId },
        data: { status: 'ACTIVE' },
      });
    }
  }

  if (eventType === 'invoice.payment_failed' || eventType === 'payment.failed') {
    const subscriptionExternalId = (body.subscription ?? body.subscriptionId) as string;
    if (subscriptionExternalId) {
      await prisma.subscription.updateMany({
        where: { externalId: subscriptionExternalId },
        data: { status: 'PAST_DUE' },
      });
    }
  }

  return NextResponse.json({ received: true });
}
