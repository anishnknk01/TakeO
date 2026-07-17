import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentCustomer } from '@/lib/dal';
import { getRewardWallet, getSpinHistory } from '@/lib/rewards';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default async function RewardsPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect(ROUTES.AUTH_CUSTOMER_LOGIN);

  const [wallet, spinHistory] = await Promise.all([
    getRewardWallet(customer.id),
    getSpinHistory(customer.id, 5),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Rewards"
        description={`${wallet.pending.length} reward${wallet.pending.length !== 1 ? 's' : ''} to redeem`}
        action={
          <Link href={ROUTES.DASHBOARD_CUSTOMER_SPIN}>
            <Button size="sm">🎡 Spin Wheel</Button>
          </Link>
        }
      />

      {/* Pending rewards */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Available to Redeem</h2>
        {wallet.pending.length === 0 ? (
          <EmptyState title="No rewards yet" description="Play games and spin the wheel to earn rewards!" icon={<span className="text-4xl">🎁</span>} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {wallet.pending.map((c) => (
              <Card key={c.id} padding="sm" className="flex items-start gap-3 border-green-100 bg-green-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-lg">🎁</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">{c.reward.name}</p>
                  <Badge variant="green">{c.reward.type.replace(/_/g, ' ')}</Badge>
                  <div className="mt-2 rounded-md bg-white px-3 py-1.5">
                    <p className="text-xs text-gray-400">Code</p>
                    <p className="font-mono font-bold text-brand-700 text-sm">{c.redemptionCode}</p>
                  </div>
                  {c.expiresAt && (
                    <p className="mt-1 text-xs text-gray-400">
                      Expires: {new Date(c.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Redeemed */}
      {wallet.redeemed.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Redeemed</h2>
          <div className="space-y-2">
            {wallet.redeemed.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-300">✓</span>
                <p className="text-sm text-gray-500">{c.reward.name}</p>
                <span className="ml-auto text-xs text-gray-400">{c.redeemedAt ? new Date(c.redeemedAt).toLocaleDateString() : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spin history */}
      {spinHistory.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent Spins</h2>
          <div className="space-y-2">
            {spinHistory.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg bg-purple-50 px-3 py-2">
                <span>🎡</span>
                <p className="text-sm text-gray-700">{s.prize.label}</p>
                <span className="ml-auto text-xs text-gray-400">{new Date(s.spunAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
