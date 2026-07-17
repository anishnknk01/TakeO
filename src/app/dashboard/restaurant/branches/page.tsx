import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function BranchesListPage(props: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const { search = '', page: pageStr = '1' } = await props.searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    restaurant: { restaurantGroupId: owner.restaurantGroupId },
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [branches, total] = await Promise.all([
    prisma.branch.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: { select: { name: true } },
        _count: { select: { staffAssignments: true } },
      },
    }),
    prisma.branch.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        description={`${total} branch${total !== 1 ? 'es' : ''}`}
        action={
          <Link href={ROUTES.DASHBOARD_RESTAURANT_BRANCHES_NEW}>
            <Button size="sm">+ Add Branch</Button>
          </Link>
        }
      />

      <form method="GET" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search branches…"
          className="block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <Button type="submit" variant="secondary" size="sm">Search</Button>
      </form>

      {branches.length === 0 ? (
        <EmptyState
          title="No branches yet"
          description="Add a branch to a restaurant."
          action={<Link href={ROUTES.DASHBOARD_RESTAURANT_BRANCHES_NEW}><Button>Add Branch</Button></Link>}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Restaurant</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.restaurant.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {[b.city, b.country].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b._count.staffAssignments}</td>
                  <td className="px-4 py-3">
                    <Badge variant={b.isActive ? 'green' : 'gray'}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`${ROUTES.DASHBOARD_RESTAURANT_BRANCHES}/${b.id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
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
