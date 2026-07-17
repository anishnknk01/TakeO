/**
 * V2 Feature 1 & 2: Challenges & Missions engine.
 * Handles creation, progress tracking, and auto-completion rewards.
 */
import 'server-only';
import { prisma } from '@/lib/prisma';
import { issueRewardClaim } from '@/lib/rewards';

export async function getActiveChallenges(customerId: string, restaurantGroupId: string) {
  return prisma.challenge.findMany({
    where: {
      restaurantGroupId,
      isActive: true,
      OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
    },
    include: {
      progress: { where: { customerId }, select: { currentValue: true, targetValue: true, status: true, completedAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Increments progress for a customer on applicable challenges.
 * Called after game plays, visits, scores, etc.
 */
export async function incrementChallengeProgress(opts: {
  customerId: string;
  restaurantGroupId: string;
  eventType: 'PLAY_GAMES' | 'VISIT_COUNT' | 'SCORE_ABOVE' | 'REFER_FRIEND';
  value?: number;
}): Promise<void> {
  const { customerId, restaurantGroupId, eventType, value = 1 } = opts;

  const challenges = await prisma.challenge.findMany({
    where: { restaurantGroupId, type: eventType, isActive: true, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] },
  });

  for (const challenge of challenges) {
    const criteria = challenge.criteria as { targetCount?: number };
    const target = criteria.targetCount ?? 1;

    const progress = await prisma.challengeProgress.upsert({
      where: { challengeId_customerId: { challengeId: challenge.id, customerId } },
      create: { challengeId: challenge.id, customerId, currentValue: value, targetValue: target, status: 'ACTIVE' },
      update: { currentValue: { increment: value } },
    });

    // Check completion
    if (progress.status === 'ACTIVE' && progress.currentValue >= target) {
      await prisma.challengeProgress.update({
        where: { id: progress.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      // Issue reward
      if (challenge.rewardId) {
        await issueRewardClaim({ customerId, rewardId: challenge.rewardId }).catch(() => null);
      }
      if (challenge.bonusPoints > 0) {
        await prisma.customer.update({
          where: { id: customerId },
          data: { totalPoints: { increment: challenge.bonusPoints } },
        });
      }
    }
  }
}
