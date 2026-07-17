/**
 * V2 Feature 7: Lucky Hours — time-based multipliers.
 */
import 'server-only';
import { prisma } from '@/lib/prisma';

export interface ActiveLuckyHour {
  id: string;
  name: string;
  type: string;
  multiplier: number;
}

/**
 * Returns the currently active lucky hour for a restaurant group (if any).
 * Checks day-of-week and time window.
 */
export async function getActiveLuckyHour(restaurantGroupId: string): Promise<ActiveLuckyHour | null> {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const luckyHours = await prisma.luckyHour.findMany({
    where: { restaurantGroupId, isActive: true },
    select: { id: true, name: true, type: true, multiplier: true, daysOfWeek: true, startTime: true, endTime: true },
  });

  for (const lh of luckyHours) {
    const days = lh.daysOfWeek as number[];
    if (!days.includes(dayOfWeek)) continue;
    if (currentTime >= lh.startTime && currentTime <= lh.endTime) {
      return { id: lh.id, name: lh.name, type: lh.type, multiplier: lh.multiplier };
    }
  }

  return null;
}
