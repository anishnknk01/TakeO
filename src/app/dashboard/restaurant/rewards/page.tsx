import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { RewardBuilder } from '@/components/rewards/RewardBuilder';
import { SpinWheelConfigPanel } from '@/components/rewards/SpinWheelConfigPanel';

export default async function RestaurantRewardsPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const [rewards, spinConfig, prizes, recentClaims] = await Promise.all([
    prisma.reward.findMany({
      where: { restaurantGroupId: owner.restaurantGroupId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.spinWheelConfig.findUnique({ where: { restaurantGroupId: owner.restaurantGroupId } }),
    prisma.spinWheelPrize.findMany({
      where: { restaurantGroupId: owner.restaurantGroupId },
      include: { reward: { select: { name: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.rewardClaim.findMany({
      where: { reward: { restaurantGroupId: owner.restaurantGroupId } },
      take: 10,
      orderBy: { issuedAt: 'desc' },
      select: {
        id: true, status: true, redemptionCode: true, issuedAt: true, redeemedAt: true,
        reward: { select: { name: true, type: true } },
        customer: { select: { displayHandle: true } },
      },
    }),
  ]);

  const statusColor: Record<string, 'green' | 'gray' | 'yellow' | 'red'> = {
    PENDING: 'yellow', REDEEMED: 'green', EXPIRED: 'gray', VOIDED: 'red',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Rewards & Spin Wheel" description="Configure rewards, prizes, and redemption rules" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rewards list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Your Rewards ({rewards.length})</h2>
          </div>
          {rewards.length === 0 ? (
            <EmptyState title="No rewards" description="Create your first reward." />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rewards.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.name}</p>
                    <div className="flex gap-2 mt-0.5">
                      <Badge variant="purple">{r.type.replace(/_/g, ' ')}</Badge>
                      {r.inventory !== null && <Badge variant="gray">Stock: {r.inventory}</Badge>}
                    </div>
                  </div>
                  <Badge variant={r.isActive ? 'green' : 'gray'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* Create reward form */}
          <RewardBuilder />
        </div>

        {/* Spin wheel config */}
        <div className="space-y-4">
          <SpinWheelConfigPanel
            config={spinConfig}
            prizes={prizes}
            rewards={rewards.map((r) => ({ id: r.id, name: r.name }))}
            restaurantGroupId={owner.restaurantGroupId}
          />
        </div>
      </div>

      {/* Recent claims */}
      {recentClaims.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent Claims</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Reward</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Issued</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentClaims.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-800">{c.reward.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{c.customer.displayHandle ?? '—'}</td>
                    <td className="px-4 py-2 font-mono text-sm text-gray-500">{c.redemptionCode}</td>
                    <td className="px-4 py-2"><Badge variant={statusColor[c.status] ?? 'gray'}>{c.status}</Badge></td>
                    <td className="px-4 py-2 text-xs text-gray-400">{new Date(c.issuedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
