/**
 * Reward engine — spin wheel, reward issuance, redemption, leaderboard prizes.
 * Server-only.
 */
import 'server-only';

import { randomBytes, randomInt } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getActiveVisit } from '@/lib/checkin';

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export class RewardError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'RewardError';
  }
}

// ---------------------------------------------------------------------------
// Redemption code generator
// ---------------------------------------------------------------------------

function generateRedemptionCode(): string {
  // 8-char alphanumeric uppercase
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[randomInt(chars.length)];
  }
  return code;
}

// ---------------------------------------------------------------------------
// Issue a reward claim to a customer
// ---------------------------------------------------------------------------

export async function issueRewardClaim(opts: {
  customerId: string;
  rewardId: string;
  expiresInDays?: number;
}): Promise<{ claimId: string; redemptionCode: string }> {
  const { customerId, rewardId, expiresInDays = 7 } = opts;

  const reward = await prisma.reward.findFirst({
    where: { id: rewardId, isActive: true, deletedAt: null },
  });
  if (!reward) throw new RewardError('reward_not_found', 'Reward not available.');

  // Check inventory
  if (reward.inventory !== null && reward.inventory <= 0) {
    throw new RewardError('out_of_stock', 'This reward is out of stock.');
  }

  const expiresAt = reward.expiresAt ?? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  const redemptionCode = generateRedemptionCode();

  const claim = await prisma.$transaction(async (tx) => {
    // Decrement inventory if limited
    if (reward.inventory !== null) {
      await tx.reward.update({
        where: { id: rewardId },
        data: { inventory: { decrement: 1 } },
      });
    }

    return tx.rewardClaim.create({
      data: {
        customerId,
        rewardId,
        status: 'PENDING',
        redemptionCode,
        expiresAt,
        issuedAt: new Date(),
      },
    });
  });

  return { claimId: claim.id, redemptionCode };
}

// ---------------------------------------------------------------------------
// Spin Wheel
// ---------------------------------------------------------------------------

export interface SpinResult {
  prizeId: string;
  prizeLabel: string;
  rewardId: string;
  rewardName: string;
  claimId: string;
  redemptionCode: string;
}

/**
 * Executes a spin wheel draw for a customer.
 * Validates eligibility, selects prize by weighted probability, issues claim.
 */
export async function executeSpin(customerId: string, restaurantGroupId: string): Promise<SpinResult> {
  // 1. Check config exists and is enabled
  const config = await prisma.spinWheelConfig.findUnique({ where: { restaurantGroupId } });
  if (!config?.isEnabled) {
    throw new RewardError('spin_disabled', 'The spin wheel is not enabled for this restaurant.');
  }

  // 2. Active visit check
  const visit = await getActiveVisit(customerId);
  if (!visit) {
    throw new RewardError('no_active_session', 'You must be checked in to spin.');
  }

  // 3. Eligibility check
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  if (config.eligibility === 'ONE_PER_VISIT') {
    const existingSpin = await prisma.spinHistory.findFirst({
      where: { customerId, spunAt: { gte: visit.checkInAt } },
    });
    if (existingSpin) throw new RewardError('already_spun', 'You can only spin once per visit.');
  } else if (config.eligibility === 'ONE_PER_DAY') {
    const todaySpins = await prisma.spinHistory.count({
      where: { customerId, spunAt: { gte: dayStart } },
    });
    if (todaySpins >= config.dailySpinLimit) {
      throw new RewardError('daily_limit', `You can only spin ${config.dailySpinLimit} time(s) per day.`);
    }
  } else if (config.eligibility === 'MIN_GAME_SCORE') {
    // Check if customer has a completed game session today with score >= minScoreRequired
    const hasQualifying = await prisma.gameSession.findFirst({
      where: {
        customerId,
        status: 'COMPLETED',
        startedAt: { gte: dayStart },
        finalScore: { gte: config.minScoreRequired },
      },
    });
    if (!hasQualifying) {
      throw new RewardError('min_score_not_met', `Score at least ${config.minScoreRequired} in a game today to spin.`);
    }
  }

  // 4. Get active prizes with inventory > 0 (or unlimited)
  const prizes = await prisma.spinWheelPrize.findMany({
    where: {
      restaurantGroupId,
      isActive: true,
      OR: [{ inventory: null }, { inventory: { gt: 0 } }],
    },
    include: { reward: true },
    orderBy: { sortOrder: 'asc' },
  });

  if (prizes.length === 0) {
    throw new RewardError('no_prizes', 'No prizes available. Please try again later.');
  }

  // 5. Weighted random draw
  const totalWeight = prizes.reduce((sum, p) => sum + p.probability, 0);
  const rand = Math.random() * totalWeight;
  let cumulative = 0;
  let selected = prizes[0]!;
  for (const prize of prizes) {
    cumulative += prize.probability;
    if (rand <= cumulative) {
      selected = prize;
      break;
    }
  }

  // 6. Decrement prize inventory if limited
  if (selected.inventory !== null) {
    await prisma.spinWheelPrize.update({
      where: { id: selected.id },
      data: { inventory: { decrement: 1 } },
    });
  }

  // 7. Issue reward claim
  const { claimId, redemptionCode } = await issueRewardClaim({
    customerId,
    rewardId: selected.rewardId,
    expiresInDays: 7,
  });

  // 8. Record spin history
  const drawSeed = randomBytes(16).toString('hex');
  await prisma.spinHistory.create({
    data: {
      customerId,
      prizeId: selected.id,
      drawSeed,
      spunAt: new Date(),
    },
  });

  return {
    prizeId: selected.id,
    prizeLabel: selected.label,
    rewardId: selected.rewardId,
    rewardName: selected.reward.name,
    claimId,
    redemptionCode,
  };
}

// ---------------------------------------------------------------------------
// Redemption
// ---------------------------------------------------------------------------

export interface RedeemResult {
  success: true;
  rewardName: string;
  rewardType: string;
  value: number | null;
}

/**
 * Redeems a reward claim using its code.
 * Called by restaurant staff.
 */
export async function redeemReward(
  redemptionCode: string,
  staffId: string,
  branchId: string,
): Promise<RedeemResult> {
  const claim = await prisma.rewardClaim.findFirst({
    where: { redemptionCode },
    include: { reward: { include: { restaurantGroup: true } } },
  });

  if (!claim) throw new RewardError('not_found', 'Reward code not found.');
  if (claim.status === 'REDEEMED') throw new RewardError('already_redeemed', 'This reward has already been redeemed.');
  if (claim.status === 'EXPIRED' || claim.status === 'VOIDED') {
    throw new RewardError('expired', 'This reward has expired or been voided.');
  }
  if (claim.expiresAt && claim.expiresAt < new Date()) {
    await prisma.rewardClaim.update({ where: { id: claim.id }, data: { status: 'EXPIRED' } });
    throw new RewardError('expired', 'This reward has expired.');
  }

  // Validate branch belongs to same restaurant group as the reward
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, restaurant: { restaurantGroupId: claim.reward.restaurantGroupId } },
  });
  if (!branch) throw new RewardError('wrong_restaurant', 'This reward cannot be redeemed at this location.');

  // Mark as redeemed
  await prisma.rewardClaim.update({
    where: { id: claim.id },
    data: { status: 'REDEEMED', redeemedAt: new Date() },
  });

  // Audit
  await prisma.auditLog.create({
    data: {
      action: 'REWARD_REDEEMED',
      entityType: 'RewardClaim',
      entityId: claim.id,
      actorId: staffId,
      actorRole: 'RESTAURANT_STAFF',
      note: `Redeemed code ${redemptionCode}`,
    },
  }).catch(() => null);

  return {
    success: true,
    rewardName: claim.reward.name,
    rewardType: claim.reward.type,
    value: claim.reward.value,
  };
}

// ---------------------------------------------------------------------------
// Leaderboard reward issuance — called at end of period
// ---------------------------------------------------------------------------

/**
 * Issues leaderboard rewards for a given period and date.
 * Reads LeaderboardRewardRule entries for the group and period,
 * finds winners from the appropriate entries, issues claims.
 */
export async function issueLeaderboardRewards(opts: {
  restaurantGroupId: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  periodDate: Date;
}): Promise<{ issued: number }> {
  const { restaurantGroupId, period, periodDate } = opts;

  const rules = await prisma.leaderboardRewardRule.findMany({
    where: { restaurantGroupId, period },
    include: { reward: true },
  });

  if (rules.length === 0) return { issued: 0 };

  // Get entries for this period sorted by rank
  let entries: { customerId: string; rank: number | null }[] = [];

  if (period === 'DAILY') {
    const lb = await prisma.dailyLeaderboard.findFirst({
      where: { restaurantGroupId, date: periodDate, branchId: null },
      select: { id: true },
    });
    if (lb) {
      entries = await prisma.dailyLeaderboardEntry.findMany({
        where: { leaderboardId: lb.id, rank: { not: null } },
        orderBy: { rank: 'asc' },
        select: { customerId: true, rank: true },
      });
    }
  } else if (period === 'WEEKLY') {
    const lb = await prisma.weeklyLeaderboard.findFirst({
      where: { restaurantGroupId, weekStartDate: periodDate },
      select: { id: true },
    });
    if (lb) {
      entries = await prisma.weeklyLeaderboardEntry.findMany({
        where: { leaderboardId: lb.id, rank: { not: null } },
        orderBy: { rank: 'asc' },
        select: { customerId: true, rank: true },
      });
    }
  } else if (period === 'MONTHLY') {
    const lb = await prisma.monthlyLeaderboard.findFirst({
      where: { restaurantGroupId, monthStartDate: periodDate },
      select: { id: true },
    });
    if (lb) {
      entries = await prisma.monthlyLeaderboardEntry.findMany({
        where: { leaderboardId: lb.id, rank: { not: null } },
        orderBy: { rank: 'asc' },
        select: { customerId: true, rank: true },
      });
    }
  }

  let issuedCount = 0;

  for (const rule of rules) {
    const winners = entries.filter((e) => e.rank !== null && e.rank >= rule.minRank && e.rank <= rule.maxRank);
    for (const winner of winners) {
      try {
        const { claimId } = await issueRewardClaim({
          customerId: winner.customerId,
          rewardId: rule.rewardId,
        });

        await prisma.winnerHistory.create({
          data: {
            customerId: winner.customerId,
            rewardId: rule.rewardId,
            rewardClaimId: claimId,
            period,
            periodDate,
            rank: winner.rank!,
            restaurantGroupId,
          },
        });
        issuedCount++;
      } catch {
        // Skip if reward is out of stock or other issue
      }
    }
  }

  return { issued: issuedCount };
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/** Customer's reward wallet — pending + redeemed claims */
export async function getRewardWallet(customerId: string) {
  const [pending, redeemed, expired] = await Promise.all([
    prisma.rewardClaim.findMany({
      where: { customerId, status: 'PENDING', expiresAt: { gt: new Date() } },
      include: { reward: { select: { name: true, type: true, value: true, imageUrl: true } } },
      orderBy: { issuedAt: 'desc' },
    }),
    prisma.rewardClaim.findMany({
      where: { customerId, status: 'REDEEMED' },
      include: { reward: { select: { name: true, type: true, value: true, imageUrl: true } } },
      orderBy: { redeemedAt: 'desc' },
      take: 20,
    }),
    prisma.rewardClaim.findMany({
      where: { customerId, status: { in: ['EXPIRED', 'VOIDED'] } },
      include: { reward: { select: { name: true, type: true, value: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
  ]);

  return { pending, redeemed, expired };
}

/** Customer's spin history */
export async function getSpinHistory(customerId: string, limit = 20) {
  return prisma.spinHistory.findMany({
    where: { customerId },
    include: { prize: { select: { label: true, reward: { select: { name: true, type: true } } } } },
    orderBy: { spunAt: 'desc' },
    take: limit,
  });
}

/** Check if customer can spin now */
export async function canCustomerSpin(customerId: string, restaurantGroupId: string): Promise<{ canSpin: boolean; reason?: string }> {
  const config = await prisma.spinWheelConfig.findUnique({ where: { restaurantGroupId } });
  if (!config?.isEnabled) return { canSpin: false, reason: 'Spin wheel is disabled' };

  const visit = await getActiveVisit(customerId);
  if (!visit) return { canSpin: false, reason: 'Check in to spin' };

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  if (config.eligibility === 'ONE_PER_VISIT') {
    const existing = await prisma.spinHistory.findFirst({
      where: { customerId, spunAt: { gte: visit.checkInAt } },
    });
    if (existing) return { canSpin: false, reason: 'Already spun this visit' };
  } else if (config.eligibility === 'ONE_PER_DAY') {
    const count = await prisma.spinHistory.count({
      where: { customerId, spunAt: { gte: dayStart } },
    });
    if (count >= config.dailySpinLimit) return { canSpin: false, reason: 'Daily spin limit reached' };
  } else if (config.eligibility === 'MIN_GAME_SCORE') {
    const has = await prisma.gameSession.findFirst({
      where: { customerId, status: 'COMPLETED', startedAt: { gte: dayStart }, finalScore: { gte: config.minScoreRequired } },
    });
    if (!has) return { canSpin: false, reason: `Score ${config.minScoreRequired}+ required` };
  }

  return { canSpin: true };
}
