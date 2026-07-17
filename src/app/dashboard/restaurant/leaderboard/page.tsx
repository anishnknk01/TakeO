import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { getDailyLeaderboard, getWeeklyLeaderboard, getMonthlyLeaderboard, getLifetimeLeaderboard } from '@/lib/leaderboard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { LeaderboardConfigForm } from '@/components/leaderboard/LeaderboardConfigForm';

export default async function RestaurantLeaderboardPage(props: {
  searchParams: Promise<{ tab?: string; branchId?: string }>;
}) {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const { tab = 'daily', branchId } = await props.searchParams;
  const groupId = owner.restaurantGroupId;

  const [branches, config, daily, weekly, monthly, lifetime] = await Promise.all([
    prisma.branch.findMany({
      where: { isActive: true, deletedAt: null, restaurant: { restaurantGroupId: groupId } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.leaderboardConfig.findUnique({
      where: { restaurantGroupId: groupId },
    }),
    getDailyLeaderboard(groupId, branchId ?? null, '', 25),
    getWeeklyLeaderboard(groupId, '', 25),
    getMonthlyLeaderboard(groupId, '', 25),
    getLifetimeLeaderboard(groupId, '', 25),
  ]);

  const tabs = [
    { key: 'daily', label: "Today's Board", data: daily },
    { key: 'weekly', label: 'Weekly', data: weekly },
    { key: 'monthly', label: 'Monthly', data: monthly },
    { key: 'lifetime', label: 'All-Time', data: lifetime },
  ];
  const activeTab = tabs.find((t) => t.key === tab) ?? tabs[0]!;

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard" description="View and manage customer rankings" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Config panel */}
        <div className="lg:col-span-1">
          <LeaderboardConfigForm config={config} restaurantGroupId={groupId} />
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          {/* Branch filter */}
          {branches.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <Link href={`?tab=${tab}`}>
                <Badge variant={!branchId ? 'blue' : 'gray'}>All Branches</Badge>
              </Link>
              {branches.map((b) => (
                <Link key={b.id} href={`?tab=${tab}&branchId=${b.id}`}>
                  <Badge variant={branchId === b.id ? 'blue' : 'gray'}>{b.name}</Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map((t) => (
              <Link key={t.key} href={`?tab=${t.key}${branchId ? `&branchId=${branchId}` : ''}`}>
                <span className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}>{t.label}</span>
              </Link>
            ))}
          </div>

          {activeTab.data ? (
            <LeaderboardTable
              entries={activeTab.data.topEntries}
              title={activeTab.label}
              period={activeTab.data.period}
              date={activeTab.data.date}
              isFrozen={activeTab.data.isFrozen}
              totalParticipants={activeTab.data.totalParticipants}
              showGamesPlayed={tab !== 'daily'}
            />
          ) : (
            <Card className="text-center py-12">
              <p className="text-sm text-gray-400">No data yet for this period.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
