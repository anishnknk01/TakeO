/**
 * Analytics engine — computes and queries metrics for dashboards.
 * Designed for fast dashboard reads via pre-aggregated tables.
 * Server-only.
 */
import 'server-only';

import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function todayUTC(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

function daysAgo(days: number): Date {
  return new Date(todayUTC().getTime() - days * 24 * 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Real-time dashboard metrics (computed on-demand from live tables)
// ---------------------------------------------------------------------------

export interface DashboardOverview {
  todayVisits: number;
  activeCheckins: number;
  gamesPlayed: number;
  rewardsIssued: number;
  rewardsRedeemed: number;
  spins: number;
  newCustomers: number;
  returningCustomers: number;
  avgScore: number;
}

export async function getRestaurantDashboard(restaurantGroupId: string): Promise<DashboardOverview> {
  const today = todayUTC();

  const groupFilter = { restaurant: { restaurantGroupId } };

  const [
    todayVisits,
    activeCheckins,
    gamesPlayed,
    rewardsIssued,
    rewardsRedeemed,
    spins,
    todayNewCustomers,
    scores,
  ] = await Promise.all([
    prisma.restaurantVisit.count({ where: { branch: groupFilter, checkInAt: { gte: today } } }),
    prisma.restaurantVisit.count({ where: { branch: groupFilter, status: 'ACTIVE' } }),
    prisma.gameSession.count({ where: { branch: groupFilter, startedAt: { gte: today }, status: 'COMPLETED' } }),
    prisma.rewardClaim.count({ where: { reward: { restaurantGroupId }, issuedAt: { gte: today } } }),
    prisma.rewardClaim.count({ where: { reward: { restaurantGroupId }, status: 'REDEEMED', redeemedAt: { gte: today } } }),
    prisma.spinHistory.count({ where: { customer: { restaurantGroupId }, spunAt: { gte: today } } }),
    prisma.customer.count({ where: { restaurantGroupId, createdAt: { gte: today }, deletedAt: null } }),
    prisma.gameSession.aggregate({ where: { branch: groupFilter, startedAt: { gte: today }, status: 'COMPLETED' }, _avg: { finalScore: true } }),
  ]);

  const totalCustomersToday = await prisma.restaurantVisit.findMany({
    where: { branch: groupFilter, checkInAt: { gte: today } },
    select: { customerId: true },
    distinct: ['customerId'],
  });
  const returningCustomers = totalCustomersToday.length - todayNewCustomers;

  return {
    todayVisits,
    activeCheckins,
    gamesPlayed,
    rewardsIssued,
    rewardsRedeemed,
    spins,
    newCustomers: todayNewCustomers,
    returningCustomers: Math.max(0, returningCustomers),
    avgScore: Math.round(scores._avg.finalScore ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Customer analytics
// ---------------------------------------------------------------------------

export interface CustomerAnalytics {
  totalCustomers: number;
  newThisWeek: number;
  newThisMonth: number;
  avgVisitsPerCustomer: number;
}

export async function getCustomerAnalytics(restaurantGroupId: string): Promise<CustomerAnalytics> {
  const weekAgo = daysAgo(7);
  const monthAgo = daysAgo(30);

  const [totalCustomers, newThisWeek, newThisMonth, totalVisits] = await Promise.all([
    prisma.customer.count({ where: { restaurantGroupId, deletedAt: null } }),
    prisma.customer.count({ where: { restaurantGroupId, createdAt: { gte: weekAgo }, deletedAt: null } }),
    prisma.customer.count({ where: { restaurantGroupId, createdAt: { gte: monthAgo }, deletedAt: null } }),
    prisma.restaurantVisit.count({ where: { branch: { restaurant: { restaurantGroupId } } } }),
  ]);

  return {
    totalCustomers,
    newThisWeek,
    newThisMonth,
    avgVisitsPerCustomer: totalCustomers > 0 ? Math.round((totalVisits / totalCustomers) * 10) / 10 : 0,
  };
}

// ---------------------------------------------------------------------------
// Game analytics
// ---------------------------------------------------------------------------

export interface GameAnalyticsSummary {
  gameId: string;
  gameName: string;
  totalPlays: number;
  avgScore: number;
  avgDurationSecs: number;
  completionRate: number;
}

export async function getGameAnalytics(restaurantGroupId: string, limit = 10): Promise<GameAnalyticsSummary[]> {
  const games = await prisma.game.findMany({
    where: { status: 'ACTIVE', deletedAt: null, restaurantGames: { some: { branch: { restaurant: { restaurantGroupId } }, isActive: true } } },
    select: { id: true, name: true },
  });

  const results: GameAnalyticsSummary[] = [];

  for (const game of games.slice(0, limit)) {
    const [totalPlays, completed, scores, durations] = await Promise.all([
      prisma.gameSession.count({ where: { gameId: game.id, branch: { restaurant: { restaurantGroupId } } } }),
      prisma.gameSession.count({ where: { gameId: game.id, branch: { restaurant: { restaurantGroupId } }, status: 'COMPLETED' } }),
      prisma.gameSession.aggregate({ where: { gameId: game.id, branch: { restaurant: { restaurantGroupId } }, status: 'COMPLETED' }, _avg: { finalScore: true } }),
      prisma.gameSession.aggregate({ where: { gameId: game.id, branch: { restaurant: { restaurantGroupId } }, status: 'COMPLETED' }, _avg: { durationSecs: true } }),
    ]);

    results.push({
      gameId: game.id,
      gameName: game.name,
      totalPlays,
      avgScore: Math.round(scores._avg.finalScore ?? 0),
      avgDurationSecs: Math.round(durations._avg.durationSecs ?? 0),
      completionRate: totalPlays > 0 ? Math.round((completed / totalPlays) * 100) : 0,
    });
  }

  return results.sort((a, b) => b.totalPlays - a.totalPlays);
}

// ---------------------------------------------------------------------------
// Reward analytics
// ---------------------------------------------------------------------------

export interface RewardAnalyticsSummary {
  totalIssued: number;
  totalRedeemed: number;
  redemptionRate: number;
  spinParticipation: number;
}

export async function getRewardAnalytics(restaurantGroupId: string): Promise<RewardAnalyticsSummary> {
  const [totalIssued, totalRedeemed, spinParticipation] = await Promise.all([
    prisma.rewardClaim.count({ where: { reward: { restaurantGroupId } } }),
    prisma.rewardClaim.count({ where: { reward: { restaurantGroupId }, status: 'REDEEMED' } }),
    prisma.spinHistory.count({ where: { customer: { restaurantGroupId } } }),
  ]);

  return {
    totalIssued,
    totalRedeemed,
    redemptionRate: totalIssued > 0 ? Math.round((totalRedeemed / totalIssued) * 100) : 0,
    spinParticipation,
  };
}

// ---------------------------------------------------------------------------
// Daily trend data (last N days from DailyAnalytics table)
// ---------------------------------------------------------------------------

export async function getDailyTrend(restaurantGroupId: string, days = 7) {
  const since = daysAgo(days);
  return prisma.dailyAnalytics.findMany({
    where: { restaurantGroupId, date: { gte: since } },
    orderBy: { date: 'asc' },
    select: {
      date: true,
      totalVisits: true,
      uniqueCustomers: true,
      totalGamePlays: true,
      totalRewardsIssued: true,
      totalRewardsRedeemed: true,
      totalSpins: true,
    },
  });
}

// ---------------------------------------------------------------------------
// Platform-wide admin metrics
// ---------------------------------------------------------------------------

export interface PlatformOverview {
  totalRestaurants: number;
  totalGroups: number;
  totalCustomers: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  totalGameSessions: number;
  totalRewardsIssued: number;
  totalRewardsRedeemed: number;
}

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const today = todayUTC();
  const monthAgo = daysAgo(30);

  const [
    totalRestaurants,
    totalGroups,
    totalCustomers,
    dailyActiveUsers,
    monthlyActiveUsers,
    totalGameSessions,
    totalRewardsIssued,
    totalRewardsRedeemed,
  ] = await Promise.all([
    prisma.restaurant.count({ where: { deletedAt: null } }),
    prisma.restaurantGroup.count({ where: { deletedAt: null } }),
    prisma.customer.count({ where: { deletedAt: null } }),
    prisma.restaurantVisit.findMany({ where: { checkInAt: { gte: today } }, select: { customerId: true }, distinct: ['customerId'] }).then((r) => r.length),
    prisma.restaurantVisit.findMany({ where: { checkInAt: { gte: monthAgo } }, select: { customerId: true }, distinct: ['customerId'] }).then((r) => r.length),
    prisma.gameSession.count(),
    prisma.rewardClaim.count(),
    prisma.rewardClaim.count({ where: { status: 'REDEEMED' } }),
  ]);

  return {
    totalRestaurants,
    totalGroups,
    totalCustomers,
    dailyActiveUsers,
    monthlyActiveUsers,
    totalGameSessions,
    totalRewardsIssued,
    totalRewardsRedeemed,
  };
}

// ---------------------------------------------------------------------------
// Background job: compute daily analytics snapshot
// ---------------------------------------------------------------------------

export async function computeDailySnapshot(restaurantGroupId: string, date?: Date): Promise<void> {
  const targetDate = date ?? todayUTC();
  const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
  const groupFilter = { restaurant: { restaurantGroupId } };

  const [visits, uniqueCustomers, gamePlays, pointsAwarded, rewardsIssued, rewardsRedeemed, spins] = await Promise.all([
    prisma.restaurantVisit.count({ where: { branch: groupFilter, checkInAt: { gte: targetDate, lt: nextDay } } }),
    prisma.restaurantVisit.findMany({ where: { branch: groupFilter, checkInAt: { gte: targetDate, lt: nextDay } }, select: { customerId: true }, distinct: ['customerId'] }).then((r) => r.length),
    prisma.gameSession.count({ where: { branch: groupFilter, startedAt: { gte: targetDate, lt: nextDay }, status: 'COMPLETED' } }),
    prisma.gameSession.aggregate({ where: { branch: groupFilter, startedAt: { gte: targetDate, lt: nextDay }, status: 'COMPLETED' }, _sum: { pointsAwarded: true } }).then((r) => r._sum.pointsAwarded ?? 0),
    prisma.rewardClaim.count({ where: { reward: { restaurantGroupId }, issuedAt: { gte: targetDate, lt: nextDay } } }),
    prisma.rewardClaim.count({ where: { reward: { restaurantGroupId }, status: 'REDEEMED', redeemedAt: { gte: targetDate, lt: nextDay } } }),
    prisma.spinHistory.count({ where: { customer: { restaurantGroupId }, spunAt: { gte: targetDate, lt: nextDay } } }),
  ]);

  await prisma.dailyAnalytics.upsert({
    where: { restaurantGroupId_date: { restaurantGroupId, date: targetDate } },
    create: { restaurantGroupId, date: targetDate, totalVisits: visits, uniqueCustomers, totalGamePlays: gamePlays, totalPointsAwarded: pointsAwarded, totalRewardsIssued: rewardsIssued, totalRewardsRedeemed: rewardsRedeemed, totalSpins: spins },
    update: { totalVisits: visits, uniqueCustomers, totalGamePlays: gamePlays, totalPointsAwarded: pointsAwarded, totalRewardsIssued: rewardsIssued, totalRewardsRedeemed: rewardsRedeemed, totalSpins: spins },
  });
}

// ---------------------------------------------------------------------------
// CSV export helper
// ---------------------------------------------------------------------------

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]!);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => {
      const val = row[h];
      if (val instanceof Date) return val.toISOString();
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      return String(val ?? '');
    }).join(','));
  }
  return lines.join('\n');
}
