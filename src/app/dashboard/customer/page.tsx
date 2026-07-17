import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentCustomer } from '@/lib/dal';
import { getActiveVisit } from '@/lib/checkin';
import { prisma } from '@/lib/prisma';
import { getMyRanks } from '@/lib/leaderboard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ActiveSessionCard } from '@/components/checkin/ActiveSessionCard';

export default async function CustomerDashboardPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect(ROUTES.AUTH_CUSTOMER_LOGIN);

  if (!customer.displayHandle) {
    redirect(ROUTES.AUTH_COMPLETE_PROFILE);
  }

  const [activeVisit, recentVisits, myRanks] = await Promise.all([
    getActiveVisit(customer.id),
    prisma.restaurantVisit.findMany({
      where: { customerId: customer.id, status: { not: 'ACTIVE' } },
      take: 5,
      orderBy: { checkInAt: 'desc' },
      select: {
        id: true,
        status: true,
        checkInAt: true,
        checkOutAt: true,
        branch: { select: { name: true, restaurant: { select: { name: true } } } },
        checkInSession: { select: { method: true } },
      },
    }),
    getMyRanks(customer.id, customer.restaurantGroupId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {customer.displayHandle}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your PlayBite activity
        </p>
      </div>

      {/* Active session */}
      {activeVisit ? (
        <ActiveSessionCard
          visitId={activeVisit.id}
          branchName={activeVisit.branch.name}
          restaurantName={activeVisit.branch.restaurant.name}
          checkInAt={activeVisit.checkInAt}
          expiresAt={activeVisit.checkInSession?.expiresAt ?? null}
          method={activeVisit.checkInSession?.method ?? null}
        />
      ) : (
        <Card className="border-dashed text-center">
          <p className="text-sm font-medium text-gray-500">Not checked in</p>
          <p className="mt-1 text-xs text-gray-400">
            Scan a restaurant QR code or tap an NFC tag to start your session.
          </p>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">Total Points</p>
          <p className="mt-1 text-3xl font-bold text-brand-600">{customer.totalPoints.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Today&apos;s Rank</p>
          {myRanks.daily ? (
            <p className="mt-1 text-3xl font-bold text-gray-800">#{myRanks.daily.rank ?? '—'}</p>
          ) : (
            <p className="mt-1 text-3xl font-bold text-gray-800">—</p>
          )}
          <Link href={ROUTES.DASHBOARD_CUSTOMER_LEADERBOARD} className="text-xs text-brand-600 hover:underline">View board →</Link>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">All-Time Rank</p>
          {myRanks.lifetime ? (
            <p className="mt-1 text-3xl font-bold text-gray-800">#{myRanks.lifetime.rank ?? '—'}</p>
          ) : (
            <p className="mt-1 text-3xl font-bold text-gray-800">—</p>
          )}
        </Card>
      </div>

      {/* Recent visits */}
      {recentVisits.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent Visits</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Restaurant</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Branch</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-800">{v.branch.restaurant.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{v.branch.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{v.checkInAt.toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <Badge variant={v.status === 'COMPLETED' ? 'gray' : 'yellow'}>{v.status}</Badge>
                    </td>
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
