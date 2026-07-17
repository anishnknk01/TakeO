import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function RestaurantsListPage(props: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const { search = '', page: pageStr = '1' } = await props.searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    restaurantGroupId: owner.restaurantGroupId,
    deletedAt: null,
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { branches: { where: { deletedAt: null } } } } },
    }),
    prisma.restaurant.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurants"
        description={`${total} restaurant${total !== 1 ? 's' : ''} in your group`}
        action={
          <Link href={ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS_NEW}>
            <Button size="sm">+ Add Restaurant</Button>
          </Link>
        }
      />

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search restaurants…"
          className="block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <Button type="submit" variant="secondary" size="sm">Search</Button>
        {search && <Link href={ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS}><Button variant="ghost" size="sm">Clear</Button></Link>}
      </form>

      {restaurants.length === 0 ? (
        <EmptyState
          title="No restaurants yet"
          description="Add your first restaurant to get started."
          action={
            <Link href={ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS_NEW}>
              <Button>Add Restaurant</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Branches</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {restaurants.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{r.name}</div>
                      {r.description && <div className="mt-0.5 truncate text-xs text-gray-400 max-w-xs">{r.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r._count.branches}</td>
                    <td className="px-4 py-3">
                      <Badge variant="green">Active</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`${ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS}/${r.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Page {page} of {pages}</p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`?page=${page - 1}${search ? `&search=${search}` : ''}`}>
                    <Button variant="secondary" size="sm">Previous</Button>
                  </Link>
                )}
                {page < pages && (
                  <Link href={`?page=${page + 1}${search ? `&search=${search}` : ''}`}>
                    <Button variant="secondary" size="sm">Next</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
