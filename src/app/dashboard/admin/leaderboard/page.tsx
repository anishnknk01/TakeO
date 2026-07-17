import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentAdmin } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AdminLeaderboardActions } from '@/components/leaderboard/AdminLeaderboardActions';

export default async function AdminLeaderboardPage(props: {
  searchParams: Promise<{ tab?: string; groupId?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(ROUTES.AUTH_ADMIN_LOGIN);

  const { tab = 'flags', groupId } = await props.searchParams;

  const [flags, groups] = await Promise.all([
    prisma.leaderboardFlag.findMany({
      where: { isResolved: false },
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, reason: true, details: true, createdAt: true,
        customerId: true, restaurantGroupId: true,
        customer: { select: { displayHandle: true } },
      },
    }),
    prisma.restaurantGroup.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard Management" description="Review flags, recalculate, and manage rankings" />

      {/* Tab nav */}
      <div className="flex gap-2">
        {['flags', 'recalculate'].map((t) => (
          <Link key={t} href={`?tab=${t}`}>
            <span className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>{t}</span>
          </Link>
        ))}
      </div>

      {/* Flags tab */}
      {tab === 'flags' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{flags.length} unresolved flag{flags.length !== 1 ? 's' : ''}</p>
          {flags.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-sm text-gray-400">No unresolved flags. All clear! ✅</p>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Player</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {flags.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{f.customer.displayHandle ?? f.customerId.slice(0, 8)}</td>
                      <td className="px-4 py-3"><Badge variant="red">{f.reason}</Badge></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{f.details ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <AdminLeaderboardActions
                          flagId={f.id}
                          customerId={f.customerId}
                          restaurantGroupId={f.restaurantGroupId}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Recalculate tab */}
      {tab === 'recalculate' && (
        <div className="space-y-4">
          <Card className="max-w-lg">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Recalculate Rankings</h2>
            <p className="mb-4 text-xs text-gray-500">
              Select a group and period, then click Recalculate to recompute all ranks.
              Use Reset to archive the current period and start fresh.
            </p>
            <AdminRecalculatePanel groups={groups} />
          </Card>
        </div>
      )}
    </div>
  );
}

function AdminRecalculatePanel({ groups }: { groups: { id: string; name: string }[] }) {
  // Server component — wrap in a client component for interactivity
  return (
    <div className="space-y-3 text-sm text-gray-500">
      <p>Use the API endpoints from your cron runner or trigger them below:</p>
      <ul className="space-y-1 list-disc list-inside text-xs">
        <li><code className="font-mono">POST /api/leaderboard/recalculate</code> — action: reset_daily</li>
        <li><code className="font-mono">POST /api/leaderboard/recalculate</code> — action: reset_weekly</li>
        <li><code className="font-mono">POST /api/leaderboard/recalculate</code> — action: reset_monthly</li>
        <li><code className="font-mono">POST /api/leaderboard/recalculate</code> — action: recalculate + period + restaurantGroupId</li>
      </ul>
      <p className="text-xs text-gray-400">These endpoints require a valid platform admin session.</p>
    </div>
  );
}
