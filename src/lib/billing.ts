/**
 * Billing engine — payment provider abstraction, subscription management,
 * invoice generation, plan enforcement.
 *
 * Provider abstraction: the PaymentGateway interface can be implemented
 * for Stripe, Razorpay, PayPal, or any other provider without changing
 * the business logic.
 *
 * Server-only.
 */
import 'server-only';

import { randomInt } from 'crypto';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Payment Provider Abstraction
// ---------------------------------------------------------------------------

export interface ChargeResult {
  success: boolean;
  externalId?: string;
  failReason?: string;
}

export interface PaymentGateway {
  name: string;
  /** Create a subscription with the provider and return the external sub ID */
  createSubscription(opts: {
    groupId: string;
    planId: string;
    amountCents: number;
    currency: string;
    customerEmail: string;
  }): Promise<{ externalId: string }>;
  /** Charge an existing subscription for a billing period */
  chargeSubscription(opts: { externalId: string; amountCents: number; currency: string }): Promise<ChargeResult>;
  /** Cancel a subscription with the provider */
  cancelSubscription(externalId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Mock payment gateway (for dev/testing — no real charges)
// ---------------------------------------------------------------------------

export class MockPaymentGateway implements PaymentGateway {
  name = 'MANUAL';

  async createSubscription(opts: { groupId: string }) {
    return { externalId: `mock_sub_${opts.groupId}_${Date.now()}` };
  }

  async chargeSubscription() {
    // Always succeeds in mock mode
    return { success: true, externalId: `mock_ch_${Date.now()}` };
  }

  async cancelSubscription() {
    // no-op
  }
}

// ---------------------------------------------------------------------------
// Gateway factory — returns the configured provider
// ---------------------------------------------------------------------------

let _gateway: PaymentGateway | null = null;

export function getPaymentGateway(): PaymentGateway {
  if (_gateway) return _gateway;

  const provider = process.env.PAYMENT_PROVIDER ?? 'MANUAL';

  switch (provider) {
    case 'STRIPE':
      // In production, import and return a StripePaymentGateway implementation
      // For now, fall through to Mock
    case 'RAZORPAY':
    case 'PAYPAL':
    default:
      _gateway = new MockPaymentGateway();
  }

  return _gateway;
}

// ---------------------------------------------------------------------------
// Invoice number generator
// ---------------------------------------------------------------------------

function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const rand = String(randomInt(10000, 99999));
  return `PB-${year}${month}-${rand}`;
}

// ---------------------------------------------------------------------------
// Subscription lifecycle
// ---------------------------------------------------------------------------

/**
 * Creates a new subscription (with optional free trial).
 * Called during onboarding after the owner selects a plan.
 */
export async function createSubscription(opts: {
  restaurantGroupId: string;
  planId: string;
  ownerEmail: string;
  couponCode?: string;
}): Promise<{ subscriptionId: string; isTrial: boolean }> {
  const { restaurantGroupId, planId, ownerEmail, couponCode } = opts;

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) throw new Error('Plan not found or inactive.');

  const isTrial = plan.trialDays > 0;
  const now = new Date();
  const periodEnd = new Date(now.getTime() + (isTrial ? plan.trialDays : 30) * 24 * 60 * 60 * 1000);

  // Apply coupon if provided
  let discountCents = 0;
  if (couponCode) {
    const coupon = await prisma.billingCoupon.findFirst({
      where: { code: couponCode.toUpperCase(), isActive: true, expiresAt: { gt: now } },
    });
    if (coupon && (coupon.maxUses === null || coupon.usedCount < coupon.maxUses)) {
      if (coupon.discountType === 'percent') {
        discountCents = Math.round((plan.priceMonthly * coupon.discountValue) / 100);
      } else {
        discountCents = coupon.discountValue;
      }
      await prisma.billingCoupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  const gateway = getPaymentGateway();
  let externalId: string | null = null;

  if (!isTrial) {
    const result = await gateway.createSubscription({
      groupId: restaurantGroupId,
      planId,
      amountCents: plan.priceMonthly - discountCents,
      currency: 'usd',
      customerEmail: ownerEmail,
    });
    externalId = result.externalId;
  }

  const subscription = await prisma.subscription.create({
    data: {
      status: isTrial ? 'TRIALING' : 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      externalId,
      planId,
      restaurantGroupId,
    },
  });

  // Generate first invoice (for non-trial)
  if (!isTrial) {
    await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        status: 'PAID',
        amountDue: plan.priceMonthly - discountCents,
        amountPaid: plan.priceMonthly - discountCents,
        discountAmount: discountCents,
        currency: 'usd',
        provider: gateway.name as 'STRIPE' | 'RAZORPAY' | 'PAYPAL' | 'MANUAL',
        periodStart: now,
        periodEnd,
        dueAt: now,
        paidAt: now,
        subscriptionId: subscription.id,
        restaurantGroupId,
      },
    });
  }

  return { subscriptionId: subscription.id, isTrial };
}

/**
 * Upgrades or downgrades a subscription to a new plan.
 */
export async function changePlan(restaurantGroupId: string, newPlanId: string): Promise<void> {
  const subscription = await prisma.subscription.findFirst({
    where: { restaurantGroupId, status: { in: ['ACTIVE', 'TRIALING'] } },
  });
  if (!subscription) throw new Error('No active subscription found.');

  const newPlan = await prisma.subscriptionPlan.findUnique({ where: { id: newPlanId } });
  if (!newPlan || !newPlan.isActive) throw new Error('Plan not found or inactive.');

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { planId: newPlanId },
  });

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'Subscription',
      entityId: subscription.id,
      note: `Plan changed to ${newPlan.name}`,
    },
  }).catch(() => null);
}

/**
 * Cancels a subscription. Sets status to CANCELLED.
 */
export async function cancelSubscription(restaurantGroupId: string): Promise<void> {
  const subscription = await prisma.subscription.findFirst({
    where: { restaurantGroupId, status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
  });
  if (!subscription) throw new Error('No active subscription.');

  if (subscription.externalId) {
    const gateway = getPaymentGateway();
    await gateway.cancelSubscription(subscription.externalId).catch(() => null);
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });
}

/**
 * Processes a billing cycle renewal.
 * Called by a cron job for subscriptions with currentPeriodEnd approaching.
 */
export async function processRenewal(subscriptionId: string): Promise<{ success: boolean }> {
  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });
  if (!sub || sub.status === 'CANCELLED') return { success: false };

  const gateway = getPaymentGateway();

  if (!sub.externalId) {
    // No external sub — mark past due (manual billing)
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'PAST_DUE' },
    });
    return { success: false };
  }

  const chargeResult = await gateway.chargeSubscription({
    externalId: sub.externalId,
    amountCents: sub.plan.priceMonthly,
    currency: 'usd',
  });

  const now = new Date();
  const newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: generateInvoiceNumber(),
      status: chargeResult.success ? 'PAID' : 'PAST_DUE',
      amountDue: sub.plan.priceMonthly,
      amountPaid: chargeResult.success ? sub.plan.priceMonthly : 0,
      currency: 'usd',
      provider: gateway.name as 'STRIPE' | 'RAZORPAY' | 'PAYPAL' | 'MANUAL',
      periodStart: sub.currentPeriodEnd,
      periodEnd: newPeriodEnd,
      dueAt: now,
      paidAt: chargeResult.success ? now : null,
      subscriptionId,
      restaurantGroupId: sub.restaurantGroupId,
    },
  });

  await prisma.paymentEvent.create({
    data: {
      provider: gateway.name as 'STRIPE' | 'RAZORPAY' | 'PAYPAL' | 'MANUAL',
      eventType: chargeResult.success ? 'charge.succeeded' : 'charge.failed',
      externalId: chargeResult.externalId ?? null,
      amount: sub.plan.priceMonthly,
      currency: 'usd',
      status: chargeResult.success ? 'succeeded' : 'failed',
      failReason: chargeResult.failReason ?? null,
      invoiceId: invoice.id,
    },
  });

  if (chargeResult.success) {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'ACTIVE', currentPeriodStart: sub.currentPeriodEnd, currentPeriodEnd: newPeriodEnd },
    });
  } else {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'PAST_DUE' },
    });
  }

  return { success: chargeResult.success };
}

/**
 * Checks plan limits for a restaurant group.
 * Returns whether the group is within their plan's limits.
 */
export async function checkPlanLimits(restaurantGroupId: string): Promise<{
  withinLimits: boolean;
  branches: { current: number; max: number };
  games: { current: number; max: number };
  staff: { current: number; max: number };
}> {
  const sub = await prisma.subscription.findFirst({
    where: { restaurantGroupId, status: { in: ['ACTIVE', 'TRIALING'] } },
    include: { plan: true },
  });

  if (!sub) return { withinLimits: false, branches: { current: 0, max: 0 }, games: { current: 0, max: 0 }, staff: { current: 0, max: 0 } };

  const [branchCount, gameCount, staffCount] = await Promise.all([
    prisma.branch.count({ where: { restaurant: { restaurantGroupId }, deletedAt: null, isActive: true } }),
    prisma.restaurantGame.count({ where: { branch: { restaurant: { restaurantGroupId } }, isActive: true } }),
    prisma.restaurantStaff.count({ where: { restaurant: { restaurantGroupId }, deletedAt: null } }),
  ]);

  return {
    withinLimits: branchCount <= sub.plan.maxBranches && gameCount <= sub.plan.maxGames && staffCount <= sub.plan.maxStaff,
    branches: { current: branchCount, max: sub.plan.maxBranches },
    games: { current: gameCount, max: sub.plan.maxGames },
    staff: { current: staffCount, max: sub.plan.maxStaff },
  };
}
