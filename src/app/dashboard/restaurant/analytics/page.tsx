import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { getRestaurantDashboard, getCustomerAnalytics, getGameAnalytics, getRewardAnalytics, getDailyTrend } from '@/lib/analytics';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrendChart } from '@/components/analytics/TrendChart';

export default async function RestaurantAnalyticsPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const groupId = owner.restaurantGroupId;
  const [overview, customers, games, rewards, trend] = await Promise.all([
    getRestaurantDashboard(groupId),
    getCustomerAnalytics(groupId),
    getGameAnalytics(groupId, 5),
    getRewardAnalytics(groupId),
    getDailyTrend(groupId, 7),
  ]);

  const statCards = [
    { label: "Today's Visits", value: overview.todayVisits, color: 'text-brand-600' },
    { label: 'Active Check-ins', value: overview.activeCheckins, color: 'text-green-600' },
    { label: 'Games Played', value: overview.gamesPlayed, color: 'text-blue-600' },
    { label: 'Avg Score', value: overview.avgScore, color: 'text-purple-600' },
    { label: 'Rewards Redeemed', value: overview.rewardsRedeemed, color: 'text-orange-600' },
    { label: 'Spins', value: overview.spins, color: 'text-pink-600' },
    { label: 'New Customers', value: overview.newCustomers, color: 'text-green-600' },
    { label: 'Returning', value: overview.returningCustomers, color: 'text-gray-700' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Business intelligence for your restaurant group"
        action={
          <a href={`/api/analytics/export?days=30`} download>
            <Button variant="secondary" size="sm">📊 Export CSV</Button>
          </a>
        }
      />

      {/* Overview stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} padding="sm" className="text-center">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
          </Card>
        ))}
      </div>

      {/* 7-day trend */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-gray-700">7-Day Trend</h2>
        <TrendChart data={trend} />
      </Card>

      {/* Customer analytics */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Customer Analytics</h2>
        <div className="grid gap-4 sm:grid-cols-4 text-center">
          <div><p className="text-2xl font-bold text-gray-900">{customers.totalCustomers}</p><p className="text-xs text-gray-400">Total Customers</p></div>
          <div><p className="text-2xl font-bold text-green-600">{customers.newThisWeek}</p><p className="text-xs text-gray-400">New This Week</p></div>
          <div><p className="text-2xl font-bold text-blue-600">{customers.newThisMonth}</p><p className="text-xs text-gray-400">New This Month</p></div>
          <div><p className="text-2xl font-bold text-gray-700">{customers.avgVisitsPerCustomer}</p><p className="text-xs text-gray-400">Avg Visits/Customer</p></div>
        </div>
      </Card>

      {/* Game analytics */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Top Games</h2>
        {games.length === 0 ? (
          <p className="text-sm text-gray-400">No game data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left text-xs text-gray-500">Game</th>
                  <th className="pb-2 text-right text-xs text-gray-500">Plays</th>
                  <th className="pb-2 text-right text-xs text-gray-500">Avg Score</th>
                  <th className="pb-2 text-right text-xs text-gray-500">Avg Duration</th>
                  <th className="pb-2 text-right text-xs text-gray-500">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {games.map((g) => (
                  <tr key={g.gameId}>
                    <td className="py-2 font-medium text-gray-800">{g.gameName}</td>
                    <td className="py-2 text-right text-gray-600">{g.totalPlays}</td>
                    <td className="py-2 text-right text-gray-600">{g.avgScore}</td>
                    <td className="py-2 text-right text-gray-600">{g.avgDurationSecs}s</td>
                    <td className="py-2 text-right"><Badge variant={g.completionRate >= 80 ? 'green' : g.completionRate >= 50 ? 'yellow' : 'gray'}>{g.completionRate}%</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Reward analytics */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Reward Analytics</h2>
        <div className="grid gap-4 sm:grid-cols-4 text-center">
          <div><p className="text-2xl font-bold text-gray-900">{rewards.totalIssued}</p><p className="text-xs text-gray-400">Total Issued</p></div>
          <div><p className="text-2xl font-bold text-green-600">{rewards.totalRedeemed}</p><p className="text-xs text-gray-400">Redeemed</p></div>
          <div><p className="text-2xl font-bold text-brand-600">{rewards.redemptionRate}%</p><p className="text-xs text-gray-400">Redemption Rate</p></div>
          <div><p className="text-2xl font-bold text-purple-600">{rewards.spinParticipation}</p><p className="text-xs text-gray-400">Spin Plays</p></div>
        </div>
      </Card>
    </div>
  );
}
