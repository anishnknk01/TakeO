/**
 * GET /api/billing/plans
 * Returns all active subscription plans (public endpoint).
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(): Promise<NextResponse> {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' },
    select: {
      id: true, name: true, tier: true, description: true,
      priceMonthly: true, priceAnnual: true, trialDays: true,
      maxBranches: true, maxMonthlyCustomers: true, maxGames: true, maxStaff: true, maxPrizes: true,
      hasLeaderboard: true, hasAnalytics: true, hasExport: true, hasPrioritySupport: true,
    },
  });
  return NextResponse.json({ plans });
}
