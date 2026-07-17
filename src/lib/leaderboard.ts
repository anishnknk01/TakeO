/**
 * Leaderboard engine — updating, querying, resetting, and anti-cheat review.
 *
 * After every validated game score, `updateAllLeaderboards` is called inside
 * the existing submitGameScore transaction to keep rankings consistent.
 *
 * Resets (daily/weekly/monthly) are triggered by calling the reset functions
 * from an API route (e.g. a cron job endpoint or manual admin trigger).
 *
 * Server-only.
 */
import 'server-only';

import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Returns UTC midnight of today in the given IANA timezone. */
export function todayUTC(timezone = 'UTC'): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const [year, month, day] = formatter.format(now).split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!));
}

/** Returns the Monday of the current ISO week (UTC midnight). */
export function thisWeekMonday(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon, …
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

/** Returns UTC midnight of the first day of the current month. */
export function thisMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

// ---------------------------------------------------------------------------
// Upsert helpers for each period
// ---------------------------------------------------------------------------

async function getOrCreateDailyLeaderboard(
  restaurantGroupId: string,
  branchId: string | null,
  date: Date,
) {
  return prisma.dailyLeaderboard.upsert({
    where: {
      restaurantGroupId_branchId_date: {
        restaurantGroupId,
        branchId: branchId ?? '',
        date,
      },
    },
    create: { restaurantGroupId, branchId, date },
    update: {},
  });
}

async function getOrCreateWeeklyLeaderboard(restaurantGroupId: string, weekStart: Date) {
  return prisma.weeklyLeaderboard.upsert({
    where: { restaurantGroupId_weekStartDate: { restaurantGroupId, weekStartDate: weekStart } },
    create: { restaurantGroupId, weekStartDate: weekStart },
    update: {},
  });
}

async function getOrCreateMonthlyLeaderboard(restaurantGroupId: string, monthStart: Date) {
  return prisma.monthlyLeaderboard.upsert({
    where: { restaurantGroupId_monthStartDate: { restaurantGroupId, monthStartDate: monthStart } },
    create: { restaurantGroupId, monthStartDate: monthStart },
    update: {},
  });
}

async function getOrCreateLifetimeLeaderboard(restaurantGroupId: string) {
  return prisma.lifetimeLeaderboard.upsert({
    where: { restaurantGroupId },
    create: { restaurantGroupId },
    update: {},
  });
}

// ---------------------------------------------------------------------------
// Main entry: update all leaderboards after a validated score
// ---------------------------------------------------------------------------

/**
 * Call this inside the score-submission transaction (or just after it) to
 * update all enabled leaderboards for the customer's group.
 *
 * Points are additive: each validated game play's pointsAwarded is added.
 * Ranks are recalculated immediately after the update.
 */
export async function updateAllLeaderboards(opts: {
  customerId: string;
  branchId: string;
  restaurantGroupId: string;
  pointsAwarded: number;
}): Promise<void> {
  if (opts.pointsAwarded <= 0) return;

  const { customerId, branchId, restaurantGroupId, pointsAwarded } = opts;

  const config = await prisma.leaderboardConfig.findUnique({
    where: { restaurantGroupId },
    select: { dailyEnabled: true, weeklyEnabled: true, monthlyEnabled: true, lifetimeEnabled: true, chainWideEnabled: true },
  });

  const today = todayUTC();
  const weekStart = thisWeekMonday();
  const monthStart = thisMonthStart();

  await Promise.all([
    // Daily — branch-scoped
    config?.dailyEnabled !== false && updateDailyEntry(restaurantGroupId, branchId, customerId, today, pointsAwarded),

    // Daily — chain-wide (only if enabled and this is a chain)
    config?.chainWideEnabled && config?.dailyEnabled !== false &&
      updateDailyEntry(restaurantGroupId, null, customerId, today, pointsAwarded),

    // Weekly
    config?.weeklyEnabled !== false && updateWeeklyEntry(restaurantGroupId, customerId, weekStart, pointsAwarded),

    // Monthly
    config?.monthlyEnabled !== false && updateMonthlyEntry(restaurantGroupId, customerId, monthStart, pointsAwarded),

    // Lifetime
    config?.lifetimeEnabled !== false && updateLifetimeEntry(restaurantGroupId, customerId, pointsAwarded),
  ]);
}

async function updateDailyEntry(
  restaurantGroupId: string,
  branchId: string | null,
  customerId: string,
  date: Date,
  points: number,
) {
  const lb = await getOrCreateDailyLeaderboard(restaurantGroupId, branchId, date);
  await prisma.dailyLeaderboardEntry.upsert({
    where: { leaderboardId_customerId: { leaderboardId: lb.id, customerId } },
    create: { leaderboardId: lb.id, customerId, points },
    update: { points: { increment: points } },
  });
}

async function updateWeeklyEntry(
  restaurantGroupId: string,
  customerId: string,
  weekStart: Date,
  points: number,
) {
  const lb = await getOrCreateWeeklyLeaderboard(restaurantGroupId, weekStart);
  await prisma.weeklyLeaderboardEntry.upsert({
    where: { leaderboardId_customerId: { leaderboardId: lb.id, customerId } },
    create: { leaderboardId: lb.id, customerId, points, gamesPlayed: 1 },
    update: { points: { increment: points }, gamesPlayed: { increment: 1 } },
  });
}

async function updateMonthlyEntry(
  restaurantGroupId: string,
  customerId: string,
  monthStart: Date,
  points: number,
) {
  const lb = await getOrCreateMonthlyLeaderboard(restaurantGroupId, monthStart);
  await prisma.monthlyLeaderboardEntry.upsert({
    where: { leaderboardId_customerId: { leaderboardId: lb.id, customerId } },
    create: { leaderboardId: lb.id, customerId, points, gamesPlayed: 1 },
    update: { points: { increment: points }, gamesPlayed: { increment: 1 } },
  });
}

async function updateLifetimeEntry(
  restaurantGroupId: string,
  customerId: string,
  points: number,
) {
  const lb = await getOrCreateLifetimeLeaderboard(restaurantGroupId);
  await prisma.lifetimeLeaderboardEntry.upsert({
    where: { leaderboardId_customerId: { leaderboardId: lb.id, customerId } },
    create: { leaderboardId: lb.id, customerId, points, gamesPlayed: 1 },
    update: { points: { increment: points }, gamesPlayed: { increment: 1 } },
  });
}

// ---------------------------------------------------------------------------
// Rank calculation — dense ranking with tie support
// ---------------------------------------------------------------------------

/**
 * Recalculates ranks for a daily leaderboard by sorting DESC on points.
 * Tied customers share the same rank.
 */
export async function recalculateDailyRanks(leaderboardId: string): Promise<void> {
  const entries = await prisma.dailyLeaderboardEntry.findMany({
    where: { leaderboardId },
    orderBy: { points: 'desc' },
    select: { id: true, points: true },
  });
  await applyDenseRanks(entries, (id, rank) =>
    prisma.dailyLeaderboardEntry.update({ where: { id }, data: { rank } }),
  );
}

export async function recalculateWeeklyRanks(leaderboardId: string): Promise<void> {
  const entries = await prisma.weeklyLeaderboardEntry.findMany({
    where: { leaderboardId },
    orderBy: { points: 'desc' },
    select: { id: true, points: true },
  });
  await applyDenseRanks(entries, (id, rank) =>
    prisma.weeklyLeaderboardEntry.update({ where: { id }, data: { rank } }),
  );
}

export async function recalculateMonthlyRanks(leaderboardId: string): Promise<void> {
  const entries = await prisma.monthlyLeaderboardEntry.findMany({
    where: { leaderboardId },
    orderBy: { points: 'desc' },
    select: { id: true, points: true },
  });
  await applyDenseRanks(entries, (id, rank) =>
    prisma.monthlyLeaderboardEntry.update({ where: { id }, data: { rank } }),
  );
}

export async function recalculateLifetimeRanks(leaderboardId: string): Promise<void> {
  const entries = await prisma.lifetimeLeaderboardEntry.findMany({
    where: { leaderboardId },
    orderBy: { points: 'desc' },
    select: { id: true, points: true },
  });
  await applyDenseRanks(entries, (id, rank) =>
    prisma.lifetimeLeaderboardEntry.update({ where: { id }, data: { rank } }),
  );
}

async function applyDenseRanks(
  entries: { id: string; points: number }[],
  updater: (id: string, rank: number) => Promise<unknown>,
): Promise<void> {
  let rank = 1;
  let lastPoints: number | null = null;
  let rankIncrement = 0;

  const updates: Promise<unknown>[] = [];
  for (const entry of entries) {
    if (entry.points !== lastPoints) {
      rank += rankIncrement;
      rankIncrement = 1;
      lastPoints = entry.points;
    } else {
      rankIncrement++;
    }
    updates.push(updater(entry.id, rank));
  }
  await Promise.all(updates);
}

// ---------------------------------------------------------------------------
// Daily reset — freeze yesterday's board and create today's empty board
// ---------------------------------------------------------------------------

export async function resetDailyLeaderboards(): Promise<{ frozen: number }> {
  const yesterday = new Date(todayUTC().getTime() - 24 * 60 * 60 * 1000);

  const { count } = await prisma.dailyLeaderboard.updateMany({
    where: { date: yesterday, isFrozen: false },
    data: { isFrozen: true },
  });

  return { frozen: count };
}

export async function resetWeeklyLeaderboards(): Promise<{ frozen: number }> {
  const lastWeekStart = new Date(thisWeekMonday().getTime() - 7 * 24 * 60 * 60 * 1000);

  const { count } = await prisma.weeklyLeaderboard.updateMany({
    where: { weekStartDate: lastWeekStart, isFrozen: false },
    data: { isFrozen: true },
  });

  return { frozen: count };
}

export async function resetMonthlyLeaderboards(): Promise<{ frozen: number }> {
  const now = new Date();
  const prevMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

  const { count } = await prisma.monthlyLeaderboard.updateMany({
    where: { monthStartDate: prevMonthStart, isFrozen: false },
    data: { isFrozen: true },
  });

  return { frozen: count };
}

// ---------------------------------------------------------------------------
// Query: get leaderboard with entries
// ---------------------------------------------------------------------------

export interface LeaderboardEntry {
  rank: number | null;
  points: number;
  gamesPlayed?: number;
  customer: { id: string; displayHandle: string | null };
}

export interface LeaderboardResult {
  period: string;
  date?: string;
  isFrozen: boolean;
  topEntries: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
  totalParticipants: number;
}

export async function getDailyLeaderboard(
  restaurantGroupId: string,
  branchId: string | null,
  customerId: string,
  topN = 10,
): Promise<LeaderboardResult | null> {
  const today = todayUTC();
  const lb = await prisma.dailyLeaderboard.findFirst({
    where: {
      restaurantGroupId,
      branchId: branchId ?? null,
      date: today,
    },
    select: { id: true, isFrozen: true, date: true },
  });
  if (!lb) return null;

  const [topEntries, myEntry, total] = await Promise.all([
    prisma.dailyLeaderboardEntry.findMany({
      where: { leaderboardId: lb.id },
      orderBy: { points: 'desc' },
      take: topN,
      select: { rank: true, points: true, customer: { select: { id: true, displayHandle: true } } },
    }),
    prisma.dailyLeaderboardEntry.findFirst({
      where: { leaderboardId: lb.id, customerId },
      select: { rank: true, points: true, customer: { select: { id: true, displayHandle: true } } },
    }),
    prisma.dailyLeaderboardEntry.count({ where: { leaderboardId: lb.id } }),
  ]);

  return {
    period: 'DAILY',
    date: lb.date.toISOString().split('T')[0],
    isFrozen: lb.isFrozen,
    topEntries,
    myEntry: myEntry ?? null,
    totalParticipants: total,
  };
}

export async function getWeeklyLeaderboard(
  restaurantGroupId: string,
  customerId: string,
  topN = 10,
): Promise<LeaderboardResult | null> {
  const weekStart = thisWeekMonday();
  const lb = await prisma.weeklyLeaderboard.findFirst({
    where: { restaurantGroupId, weekStartDate: weekStart },
    select: { id: true, isFrozen: true, weekStartDate: true },
  });
  if (!lb) return null;

  const [topEntries, myEntry, total] = await Promise.all([
    prisma.weeklyLeaderboardEntry.findMany({
      where: { leaderboardId: lb.id },
      orderBy: { points: 'desc' },
      take: topN,
      select: { rank: true, points: true, gamesPlayed: true, customer: { select: { id: true, displayHandle: true } } },
    }),
    prisma.weeklyLeaderboardEntry.findFirst({
      where: { leaderboardId: lb.id, customerId },
      select: { rank: true, points: true, gamesPlayed: true, customer: { select: { id: true, displayHandle: true } } },
    }),
    prisma.weeklyLeaderboardEntry.count({ where: { leaderboardId: lb.id } }),
  ]);

  return {
    period: 'WEEKLY',
    date: lb.weekStartDate.toISOString().split('T')[0],
    isFrozen: lb.isFrozen,
    topEntries,
    myEntry: myEntry ?? null,
    totalParticipants: total,
  };
}

export async function getMonthlyLeaderboard(
  restaurantGroupId: string,
  customerId: string,
  topN = 10,
): Promise<LeaderboardResult | null> {
  const monthStart = thisMonthStart();
  const lb = await prisma.monthlyLeaderboard.findFirst({
    where: { restaurantGroupId, monthStartDate: monthStart },
    select: { id: true, isFrozen: true, monthStartDate: true },
  });
  if (!lb) return null;

  const [topEntries, myEntry, total] = await Promise.all([
    prisma.monthlyLeaderboardEntry.findMany({
      where: { leaderboardId: lb.id },
      orderBy: { points: 'desc' },
      take: topN,
      select: { rank: true, points: true, gamesPlayed: true, customer: { select: { id: true, displayHandle: true } } },
    }),
    prisma.monthlyLeaderboardEntry.findFirst({
      where: { leaderboardId: lb.id, customerId },
      select: { rank: true, points: true, gamesPlayed: true, customer: { select: { id: true, displayHandle: true } } },
    }),
    prisma.monthlyLeaderboardEntry.count({ where: { leaderboardId: lb.id } }),
  ]);

  return {
    period: 'MONTHLY',
    date: lb.monthStartDate.toISOString().split('T')[0],
    isFrozen: lb.isFrozen,
    topEntries,
    myEntry: myEntry ?? null,
    totalParticipants: total,
  };
}

export async function getLifetimeLeaderboard(
  restaurantGroupId: string,
  customerId: string,
  topN = 10,
): Promise<LeaderboardResult | null> {
  const lb = await prisma.lifetimeLeaderboard.findFirst({
    where: { restaurantGroupId },
    select: { id: true },
  });
  if (!lb) return null;

  const [topEntries, myEntry, total] = await Promise.all([
    prisma.lifetimeLeaderboardEntry.findMany({
      where: { leaderboardId: lb.id },
      orderBy: { points: 'desc' },
      take: topN,
      select: { rank: true, points: true, gamesPlayed: true, customer: { select: { id: true, displayHandle: true } } },
    }),
    prisma.lifetimeLeaderboardEntry.findFirst({
      where: { leaderboardId: lb.id, customerId },
      select: { rank: true, points: true, gamesPlayed: true, customer: { select: { id: true, displayHandle: true } } },
    }),
    prisma.lifetimeLeaderboardEntry.count({ where: { leaderboardId: lb.id } }),
  ]);

  return {
    period: 'LIFETIME',
    isFrozen: false,
    topEntries,
    myEntry: myEntry ?? null,
    totalParticipants: total,
  };
}

/** Returns the customer's rank + points across all active periods for a group. */
export async function getMyRanks(customerId: string, restaurantGroupId: string) {
  const [daily, weekly, monthly, lifetime] = await Promise.all([
    getDailyLeaderboard(restaurantGroupId, null, customerId, 0),
    getWeeklyLeaderboard(restaurantGroupId, customerId, 0),
    getMonthlyLeaderboard(restaurantGroupId, customerId, 0),
    getLifetimeLeaderboard(restaurantGroupId, customerId, 0),
  ]);

  return {
    daily: daily?.myEntry ?? null,
    weekly: weekly?.myEntry ?? null,
    monthly: monthly?.myEntry ?? null,
    lifetime: lifetime?.myEntry ?? null,
  };
}

// ---------------------------------------------------------------------------
// Anti-cheat: flag a customer on the leaderboard
// ---------------------------------------------------------------------------

export async function flagLeaderboardCustomer(opts: {
  customerId: string;
  restaurantGroupId: string;
  reason: string;
  details?: string;
}): Promise<void> {
  await prisma.leaderboardFlag.create({
    data: {
      customerId: opts.customerId,
      restaurantGroupId: opts.restaurantGroupId,
      reason: opts.reason,
      details: opts.details ?? null,
    },
  });
}

/** Admin: resolve a flag (dismiss or action taken). */
export async function resolveLeaderboardFlag(flagId: string, adminId: string): Promise<void> {
  await prisma.leaderboardFlag.update({
    where: { id: flagId },
    data: { isResolved: true, resolvedBy: adminId, resolvedAt: new Date() },
  });
}

/** Admin: remove a customer's entry from all current leaderboards (score invalidation). */
export async function removeCustomerFromLeaderboards(
  customerId: string,
  restaurantGroupId: string,
): Promise<void> {
  const today = todayUTC();
  const weekStart = thisWeekMonday();
  const monthStart = thisMonthStart();

  const [dailyLb, weeklyLb, monthlyLb, lifetimeLb] = await Promise.all([
    prisma.dailyLeaderboard.findFirst({ where: { restaurantGroupId, date: today }, select: { id: true } }),
    prisma.weeklyLeaderboard.findFirst({ where: { restaurantGroupId, weekStartDate: weekStart }, select: { id: true } }),
    prisma.monthlyLeaderboard.findFirst({ where: { restaurantGroupId, monthStartDate: monthStart }, select: { id: true } }),
    prisma.lifetimeLeaderboard.findFirst({ where: { restaurantGroupId }, select: { id: true } }),
  ]);

  await Promise.all([
    dailyLb && prisma.dailyLeaderboardEntry.deleteMany({ where: { leaderboardId: dailyLb.id, customerId } }),
    weeklyLb && prisma.weeklyLeaderboardEntry.deleteMany({ where: { leaderboardId: weeklyLb.id, customerId } }),
    monthlyLb && prisma.monthlyLeaderboardEntry.deleteMany({ where: { leaderboardId: monthlyLb.id, customerId } }),
    lifetimeLb && prisma.lifetimeLeaderboardEntry.deleteMany({ where: { leaderboardId: lifetimeLb.id, customerId } }),
  ]);
}

// ---------------------------------------------------------------------------
// Suspicious pattern detection — called after score submission
// ---------------------------------------------------------------------------

/**
 * Detects abnormal play frequency: if a customer has played more than
 * 20 times in a 30-minute window, flag them.
 */
export async function detectAbnormalFrequency(
  customerId: string,
  restaurantGroupId: string,
): Promise<void> {
  const windowStart = new Date(Date.now() - 30 * 60 * 1000);
  const count = await prisma.gameSession.count({
    where: {
      customerId,
      startedAt: { gte: windowStart },
      status: { in: ['COMPLETED', 'STARTED'] },
    },
  });

  if (count >= 20) {
    await flagLeaderboardCustomer({
      customerId,
      restaurantGroupId,
      reason: 'abnormal_frequency',
      details: `${count} games in 30 minutes`,
    }).catch(() => null);
  }
}
