import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export const revalidate = 0; // always fresh

export default async function ActiveVisitorsPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  // Expire stale visits lazily on page load
  const stale = await prisma.checkInSession.findMany({
    where: { expiresAt: { lt: new Date() }, visit: { status: 'ACTIVE' } },
    select: { visitId: true },
  });
  if (stale.length > 0) {
    await prisma.restaurantVisit.updateMany({
      where: { id: { in: stale.map((s) => s.visitId) } },
      data: { status: 'EXPIRED', checkOutAt: new Date() },
    });
  }

  const activeVisits = await prisma.restaurantVisit.findMany({
    where: {
      status: 'ACTIVE',
      branch: { restaurant: { restaurantGroupId: owner.restaurantGroupId } },
    },
    include: {
      branch: { select: { name: true, restaurant: { select: { name: true } } } },
      customer: { select: { displayHandle: true } },
      checkInSession: { select: { method: true, expiresAt: true } },
    },
    orderBy: { checkInAt: 'desc' },
  });

  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Visitors"
        description={`${activeVisits.length} customer${activeVisits.length !== 1 ? 's' : ''} currently checked in`}
      />

      {activeVisits.length === 0 ? (
        <EmptyState title="No active visitors" description="No customers are currently checked in." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Checked In</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Session Ends</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Time Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeVisits.map((v) => {
                const expiresAt = v.checkInSession?.expiresAt;
                const msLeft = expiresAt ? expiresAt.getTime() - now.getTime() : null;
                const minsLeft = msLeft ? Math.max(0, Math.floor(msLeft / 60000)) : null;
                const isExpiringSoon = minsLeft !== null && minsLeft < 30;

                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {v.customer.displayHandle ?? '(no handle)'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{v.branch.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={v.checkInSession?.method === 'QR_CODE' ? 'blue' : v.checkInSession?.method === 'NFC_TAG' ? 'purple' : 'gray'}>
                        {v.checkInSession?.method?.replace('_', ' ') ?? '—'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {v.checkInAt.toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {expiresAt ? expiresAt.toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {minsLeft !== null ? (
                        <Badge variant={isExpiringSoon ? 'yellow' : 'green'}>
                          {minsLeft}m
                        </Badge>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
