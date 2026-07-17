/**
 * V2 Feature 12: Achievement System.
 */
import 'server-only';
import { prisma } from '@/lib/prisma';

export async function getCustomerAchievements(customerId: string, restaurantGroupId: string) {
  const [all, unlocked] = await Promise.all([
    prisma.achievement.findMany({
      where: { OR: [{ restaurantGroupId }, { restaurantGroupId: null }], isActive: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.achievementUnlock.findMany({
      where: { customerId },
      select: { achievementId: true, unlockedAt: true },
    }),
  ]);

  const unlockedSet = new Set(unlocked.map((u) => u.achievementId));

  return all.map((a) => ({
    ...a,
    isUnlocked: unlockedSet.has(a.id),
    unlockedAt: unlocked.find((u) => u.achievementId === a.id)?.unlockedAt ?? null,
  }));
}

/**
 * Checks and unlocks achievements after events.
 * Called after game plays, visits, leaderboard wins, etc.
 */
export async function checkAndUnlockAchievements(customerId: string, restaurantGroupId: string): Promise<string[]> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { totalPoints: true, _count: { select: { visits: true, gameSessions: { where: { status: 'COMPLETED' } } } } },
  });
  if (!customer) return [];

  const achievements = await prisma.achievement.findMany({
    where: { OR: [{ restaurantGroupId }, { restaurantGroupId: null }], isActive: true },
  });

  const alreadyUnlocked = await prisma.achievementUnlock.findMany({
    where: { customerId },
    select: { achievementId: true },
  });
  const unlockedIds = new Set(alreadyUnlocked.map((u) => u.achievementId));
  const newUnlocks: string[] = [];

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    const criteria = achievement.criteria as { type: string; target: number };
    let earned = false;

    switch (criteria.type) {
      case 'games_played':
        earned = customer._count.gameSessions >= criteria.target;
        break;
      case 'visits':
        earned = customer._count.visits >= criteria.target;
        break;
      case 'total_points':
        earned = customer.totalPoints >= criteria.target;
        break;
      case 'first_visit':
        earned = customer._count.visits >= 1;
        break;
    }

    if (earned) {
      await prisma.achievementUnlock.create({ data: { achievementId: achievement.id, customerId } });
      if (achievement.pointsReward > 0) {
        await prisma.customer.update({ where: { id: customerId }, data: { totalPoints: { increment: achievement.pointsReward } } });
      }
      newUnlocks.push(achievement.id);
    }
  }

  return newUnlocks;
}
