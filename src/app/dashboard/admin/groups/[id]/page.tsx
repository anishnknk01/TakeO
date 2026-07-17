import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentAdmin } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { AdminGroupActions } from '@/components/restaurant/AdminGroupActions';

export default async function AdminGroupDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(ROUTES.AUTH_ADMIN_LOGIN);

  const { id } = await props.params;

  const group = await prisma.restaurantGroup.findFirst({
    where: { id },
    include: {
      restaurants: {
        where: { deletedAt: null },
        include: { branches: { where: { deletedAt: null } } },
      },
      subscription: { include: { plan: true } },
      owners: { where: { deletedAt: null }, select: { id: true, email: true, name: true } },
      _count: { select: { customers: { where: { deletedAt: null } } } },
    },
  });
  if (!group) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={group.name}
        description={`Group ID: ${group.id}`}
        action={<Link href={ROUTES.DASHBOARD_ADMIN_GROUPS}><Button variant="secondary" size="sm">← Back</Button></Link>}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><p className="text-xs text-gray-500">Type</p><p className="mt-1 font-semibold">{group.isChain ? 'Chain' : 'Independent'}</p></Card>
        <Card><p className="text-xs text-gray-500">Restaurants</p><p className="mt-1 font-semibold">{group.restaurants.length}</p></Card>
        <Card><p className="text-xs text-gray-500">Customers</p><p className="mt-1 font-semibold">{group._count.customers}</p></Card>
        <Card>
          <p className="text-xs text-gray-500">Status</p>
          <div className="mt-1">
            {group.deletedAt ? <Badge variant="red">Suspended</Badge> : <Badge variant="green">Active</Badge>}
          </div>
        </Card>
      </div>

      {/* Subscription */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Subscription</h2>
        {group.subscription ? (
          <div className="flex flex-wrap gap-4 text-sm">
            <span><span className="text-gray-500">Plan:</span> {group.subscription.plan.name}</span>
            <span><span className="text-gray-500">Status:</span> {group.subscription.status}</span>
            <span><span className="text-gray-500">Period end:</span> {new Date(group.subscription.currentPeriodEnd).toLocaleDateString()}</span>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No active subscription</p>
        )}
      </Card>

      {/* Owners */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Owners</h2>
        {group.owners.map((o) => (
          <div key={o.id} className="flex items-center gap-3 py-1 text-sm">
            <span className="font-medium text-gray-900">{o.name}</span>
            <span className="text-gray-500">{o.email}</span>
          </div>
        ))}
      </Card>

      {/* Restaurants */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Restaurants</h2>
        {group.restaurants.length === 0 ? (
          <p className="text-sm text-gray-400">No restaurants yet.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Branches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {group.restaurants.map((r) => (
                <tr key={r.id}>
                  <td className="py-1.5 font-medium text-gray-800">{r.name}</td>
                  <td className="py-1.5 text-gray-500">{r.branches.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Admin actions */}
      <AdminGroupActions groupId={group.id} isSuspended={!!group.deletedAt} />
    </div>
  );
}
