import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentAdmin } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function AdminGroupsPage(props: {
  searchParams: Promise<{ search?: string; page?: string; includeDeleted?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(ROUTES.AUTH_ADMIN_LOGIN);

  const { search = '', page: pageStr = '1', includeDeleted = 'false' } = await props.searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const limit = 20;
  const skip = (page - 1) * limit;
  const showDeleted = includeDeleted === 'true';

  const where = {
    ...(showDeleted ? {} : { deletedAt: null }),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [groups, total] = await Promise.all([
    prisma.restaurantGroup.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, slug: true, isChain: true, deletedAt: true, createdAt: true,
        _count: { select: { restaurants: { where: { deletedAt: null } }, customers: { where: { deletedAt: null } } } },
        subscription: { select: { status: true, plan: { select: { name: true } } } },
        owners: { where: { deletedAt: null }, select: { email: true, name: true }, take: 1 },
      },
    }),
    prisma.restaurantGroup.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant Groups"
        description={`${total} group${total !== 1 ? 's' : ''}`}
        action={
          <Link href={ROUTES.DASHBOARD_ADMIN_GROUPS + '/new'}>
            <Button size="sm">+ Create Group</Button>
          </Link>
        }
      />

      <form method="GET" className="flex flex-wrap gap-2 items-center">
        <input name="search" defaultValue={search} placeholder="Search groups…"
          className="block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <Button type="submit" variant="secondary" size="sm">Search</Button>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" name="includeDeleted" value="true" defaultChecked={showDeleted}
            className="h-4 w-4 rounded border-gray-300" />
          Show suspended
        </label>
      </form>

      {groups.length === 0 ? (
        <EmptyState title="No restaurant groups" description="Create a group to onboard a restaurant owner." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Group</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Restaurants</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customers</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{g.name}</div>
                    <div className="text-xs text-gray-400">{g.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={g.isChain ? 'blue' : 'gray'}>{g.isChain ? 'Chain' : 'Independent'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{g.owners[0]?.email ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {g.subscription ? `${g.subscription.plan.name} (${g.subscription.status})` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{g._count.restaurants}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{g._count.customers}</td>
                  <td className="px-4 py-3">
                    {g.deletedAt ? (
                      <Badge variant="red">Suspended</Badge>
                    ) : (
                      <Badge variant="green">Active</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`${ROUTES.DASHBOARD_ADMIN_GROUPS}/${g.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={`?page=${page - 1}`}><Button variant="secondary" size="sm">Previous</Button></Link>}
            {page < pages && <Link href={`?page=${page + 1}`}><Button variant="secondary" size="sm">Next</Button></Link>}
          </div>
        </div>
      )}
    </div>
  );
}
