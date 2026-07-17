import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function CustomersPage(props: {
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
    ...(search ? { displayHandle: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        displayHandle: true,
        totalPoints: true,
        isActive: true,
        isBanned: true,
        createdAt: true,
        _count: { select: { visits: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description={`${total} customer${total !== 1 ? 's' : ''} in your group`} />

      <form method="GET" className="flex gap-2">
        <input name="search" defaultValue={search} placeholder="Search by display handle…"
          className="block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <Button type="submit" variant="secondary" size="sm">Search</Button>
      </form>

      {customers.length === 0 ? (
        <EmptyState title="No customers yet" description="Customers appear when they check in and log in." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Handle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Points</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Visits</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.displayHandle ?? '(no handle)'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.totalPoints.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c._count.visits}</td>
                    <td className="px-4 py-3">
                      {c.isBanned ? (
                        <Badge variant="red">Banned</Badge>
                      ) : c.isActive ? (
                        <Badge variant="green">Active</Badge>
                      ) : (
                        <Badge variant="gray">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Page {page} of {pages}</p>
              <div className="flex gap-2">
                {page > 1 && <Link href={`?page=${page - 1}`}><Button variant="secondary" size="sm">Previous</Button></Link>}
                {page < pages && <Link href={`?page=${page + 1}`}><Button variant="secondary" size="sm">Next</Button></Link>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
