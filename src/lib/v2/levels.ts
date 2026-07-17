/**
 * V2 Feature 10: Customer Levels (Bronze → Diamond).
 */
import 'server-only';
import { prisma } from '@/lib/prisma';

const LEVEL_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as const;

export async function getCustomerLevel(customerId: string, restaurantGroupId: string): Promise<{
  level: string;
  nextLevel: string | null;
  pointsToNext: number;
}> {
  const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { totalPoints: true } });
  if (!customer) return { level: 'BRONZE', nextLevel: 'SILVER', pointsToNext: 0 };

  const configs = await prisma.levelConfig.findMany({
    where: { restaurantGroupId },
    orderBy: { minPoints: 'asc' },
  });

  if (configs.length === 0) {
    // Default thresholds
    const defaults = [
      { level: 'BRONZE', min: 0 },
      { level: 'SILVER', min: 500 },
      { level: 'GOLD', min: 2000 },
      { level: 'PLATINUM', min: 10000 },
      { level: 'DIAMOND', min: 50000 },
    ];
    let current = 'BRONZE';
    let nextIdx = 1;
    for (let i = defaults.length - 1; i >= 0; i--) {
      if (customer.totalPoints >= defaults[i]!.min) {
        current = defaults[i]!.level;
        nextIdx = i + 1;
        break;
      }
    }
    const next = nextIdx < defaults.length ? defaults[nextIdx]! : null;
    return {
      level: current,
      nextLevel: next?.level ?? null,
      pointsToNext: next ? Math.max(0, next.min - customer.totalPoints) : 0,
    };
  }

  let currentLevel = configs[0]!.level;
  let nextConfig: typeof configs[0] | null = null;
  for (let i = configs.length - 1; i >= 0; i--) {
    if (customer.totalPoints >= configs[i]!.minPoints) {
      currentLevel = configs[i]!.level;
      nextConfig = configs[i + 1] ?? null;
      break;
    }
  }

  return {
    level: currentLevel,
    nextLevel: nextConfig?.level ?? null,
    pointsToNext: nextConfig ? Math.max(0, nextConfig.minPoints - customer.totalPoints) : 0,
  };
}
