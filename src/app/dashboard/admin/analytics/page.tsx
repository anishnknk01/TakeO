import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentAdmin } from '@/lib/dal';
import { getPlatformOverview } from '@/lib/analytics';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default async function AdminAnalyticsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(ROUTES.AUTH_ADMIN_LOGIN);

  const [platform, topRestaurants, topGames, recentFlags] = await Promise.all([
    getPlatformOverview(),
    prisma.restaurantGroup.findMany({
      where: { deletedAt: null },
      take: 5,
      orderBy: { customers: { _count: 'desc' } },
      select: { id: true, name: true, _count: { select: { customers: { where: { deletedAt: null } } } } },
    }),
    prisma.game.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      take: 5,
      orderBy: { gameSessions: { _count: 'desc' } },
      select: { id: true, name: true, _count: { select: { gameSessions: true } } },
    }),
    prisma.leaderboardFlag.count({ where: { isResolved: false } }),
  ]);

  const stats = [
    { label: 'Restaurants', value: platform.totalRestaurants },
    { label: 'Groups', value: platform.totalGroups },
    { label: 'Customers', value: platform.totalCustomers },
    { label: 'DAU', value: platform.dailyActiveUsers },
    { label: 'MAU', value: platform.monthlyActiveUsers },
    { label: 'Game Sessions', value: platform.totalGameSessions },
    { label: 'Rewards Issued', value: platform.totalRewardsIssued },
    { label: 'Rewards Redeemed', value: platform.totalRewardsRedeemed },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics"
        description="Bird's-eye view of PlayBite"
        action={
          <a href={`/api/analytics/export?days=30&restaurantGroupId=`} download>
            <Button variant="secondary" size="sm">📊 Export</Button>
          </a>
        }
      />

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} padding="sm" className="text-center">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Top Restaurant Groups</h2>
          {topRestaurants.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-800">{r.name}</span>
              <Badge variant="blue">{r._count.customers} customers</Badge>
            </div>
          ))}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Top Games</h2>
          {topGames.map((g) => (
            <div key={g.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-800">{g.name}</span>
              <Badge variant="purple">{g._count.gameSessions} plays</Badge>
            </div>
          ))}
        </Card>
      </div>

      {recentFlags > 0 && (
        <Card className="border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700">⚠️ {recentFlags} unresolved fraud flag{recentFlags !== 1 ? 's' : ''}</p>
              <p className="text-xs text-gray-500">Review suspicious leaderboard activity</p>
            </div>
            <a href={ROUTES.DASHBOARD_ADMIN_LEADERBOARD}>
              <Button variant="danger" size="sm">Review</Button>
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}
