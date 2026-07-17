import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentCustomer } from '@/lib/dal';
import { getGameHistory, getPersonalBests } from '@/lib/game';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function GameHistoryPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect(ROUTES.AUTH_CUSTOMER_LOGIN);

  const { page: pageStr = '1' } = await props.searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));

  const [history, personalBests] = await Promise.all([
    getGameHistory(customer.id, page),
    getPersonalBests(customer.id),
  ]);

  const completedSessions = history.sessions.filter((s) => s.status === 'COMPLETED');
  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.finalScore ?? 0), 0) / completedSessions.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Game History" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">Total Games Played</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{history.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Average Score</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{avgScore.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Personal Bests</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{personalBests.length}</p>
        </Card>
      </div>

      {/* Personal Bests */}
      {personalBests.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">🏆 Personal Bests</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {personalBests.slice(0, 6).map((pb) => (
              <Card key={pb.game.id} padding="sm" className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-50 text-xl">🎮</div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{pb.game.name}</p>
                  <p className="text-lg font-bold text-brand-600">{pb.score.toLocaleString()}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent Games</h2>
        {history.sessions.length === 0 ? (
          <EmptyState
            title="No games played yet"
            description="Check in to a restaurant and play your first game."
            action={<Link href={ROUTES.DASHBOARD_CUSTOMER_GAMES}><Button>Browse Games</Button></Link>}
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Game</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Points</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.game.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.branch.name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {s.finalScore != null ? s.finalScore.toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-600 font-medium">
                        {s.pointsAwarded > 0 ? `+${s.pointsAwarded}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.status === 'COMPLETED' ? 'green' : s.status === 'INVALID' ? 'red' : 'gray'}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{new Date(s.startedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {history.pages > 1 && (
              <div className="mt-4 flex gap-2">
                {page > 1 && <Link href={`?page=${page - 1}`}><Button variant="secondary" size="sm">Previous</Button></Link>}
                {page < history.pages && <Link href={`?page=${page + 1}`}><Button variant="secondary" size="sm">Next</Button></Link>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
