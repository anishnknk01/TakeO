import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { PageHeader } from '@/components/ui/PageHeader';
import { RedeemForm } from '@/components/rewards/RedeemForm';

export default async function RedeemPage() {
  const session = await getSessionPayload();
  if (!session || (session.role !== UserRole.RESTAURANT_OWNER && session.role !== UserRole.RESTAURANT_STAFF)) {
    redirect(ROUTES.AUTH_RESTAURANT_LOGIN);
  }

  const branches = await prisma.branch.findMany({
    where: { isActive: true, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  // Recent redemptions
  const recentRedemptions = await prisma.rewardClaim.findMany({
    where: {
      status: 'REDEEMED',
      reward: { restaurantGroupId: session.restaurantGroupId! },
    },
    take: 10,
    orderBy: { redeemedAt: 'desc' },
    select: {
      id: true, redemptionCode: true, redeemedAt: true,
      reward: { select: { name: true, type: true } },
      customer: { select: { displayHandle: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Redeem Reward" description="Enter or scan a customer's reward code" />

      <div className="grid gap-6 lg:grid-cols-2">
        <RedeemForm branches={branches} />

        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent Redemptions</h2>
          {recentRedemptions.length === 0 ? (
            <p className="text-sm text-gray-400">No recent redemptions.</p>
          ) : (
            <div className="space-y-2">
              {recentRedemptions.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.reward.name}</p>
                    <p className="text-xs text-gray-400">{r.customer.displayHandle ?? 'Customer'} • {r.redemptionCode}</p>
                  </div>
                  <span className="text-xs text-gray-400">{r.redeemedAt ? new Date(r.redeemedAt).toLocaleString() : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
