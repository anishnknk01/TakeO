import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentCustomer } from '@/lib/dal';
import { getDailyLeaderboard, getWeeklyLeaderboard, getMonthlyLeaderboard, getLifetimeLeaderboard, getMyRanks } from '@/lib/leaderboard';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';

export default async function CustomerLeaderboardPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect(ROUTES.AUTH_CUSTOMER_LOGIN);

  const { tab = 'daily' } = await props.searchParams;
  const groupId = customer.restaurantGroupId;

  const [daily, weekly, monthly, lifetime, myRanks] = await Promise.all([
    getDailyLeaderboard(groupId, null, customer.id, 10),
    getWeeklyLeaderboard(groupId, customer.id, 10),
    getMonthlyLeaderboard(groupId, customer.id, 10),
    getLifetimeLeaderboard(groupId, customer.id, 10),
    getMyRanks(customer.id, groupId),
  ]);

  const tabs = [
    { key: 'daily', label: 'Today', data: daily },
    { key: 'weekly', label: 'This Week', data: weekly },
    { key: 'monthly', label: 'This Month', data: monthly },
    { key: 'lifetime', label: 'All-Time', data: lifetime },
  ];

  const activeTab = tabs.find((t) => t.key === tab) ?? tabs[0]!;

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard" description="See how you rank against other players" />

      {/* My rank summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Today', rank: myRanks.daily?.rank, points: myRanks.daily?.points },
          { label: 'Week', rank: myRanks.weekly?.rank, points: myRanks.weekly?.points },
          { label: 'Month', rank: myRanks.monthly?.rank, points: myRanks.monthly?.points },
          { label: 'All-Time', rank: myRanks.lifetime?.rank, points: myRanks.lifetime?.points },
        ].map((s) => (
          <Card key={s.label} padding="sm" className="text-center">
            <p className="text-xs text-gray-400">{s.label}</p>
            {s.rank ? (
              <>
                <p className="text-2xl font-bold text-brand-600">#{s.rank}</p>
                <p className="text-xs text-gray-500">{(s.points ?? 0).toLocaleString()} pts</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-1">—</p>
            )}
          </Card>
        ))}
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <Link key={t.key} href={`?tab=${t.key}`}>
            <span className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
              {t.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Active leaderboard */}
      {activeTab.data ? (
        <LeaderboardTable
          entries={activeTab.data.topEntries}
          myCustomerId={customer.id}
          title={`${activeTab.label} Leaderboard`}
          period={activeTab.data.period}
          date={activeTab.data.date}
          isFrozen={activeTab.data.isFrozen}
          totalParticipants={activeTab.data.totalParticipants}
          showGamesPlayed={tab !== 'daily'}
        />
      ) : (
        <Card className="text-center py-12">
          <p className="text-2xl mb-2">🎮</p>
          <p className="text-sm text-gray-500">
            No leaderboard data yet for this period.
            Play games to appear on the board!
          </p>
        </Card>
      )}
    </div>
  );
}
