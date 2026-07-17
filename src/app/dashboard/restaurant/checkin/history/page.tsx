import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function VisitHistoryPage(props: {
  searchParams: Promise<{ page?: string; branchId?: string; status?: string }>;
}) {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const { page: pageStr = '1', branchId, status } = await props.searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const limit = 25;
  const skip = (page - 1) * limit;

  const branches = await prisma.branch.findMany({
    where: { deletedAt: null, restaurant: { restaurantGroupId: owner.restaurantGroupId } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const where = {
    branch: { restaurant: { restaurantGroupId: owner.restaurantGroupId } },
    ...(branchId ? { branchId } : {}),
    ...(status && ['ACTIVE', 'COMPLETED', 'EXPIRED', 'FLAGGED'].includes(status)
      ? { status: status as 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'FLAGGED' }
      : {}),
  };

  const [visits, total] = await Promise.all([
    prisma.restaurantVisit.findMany({
      where,
      skip,
      take: limit,
      orderBy: { checkInAt: 'desc' },
      select: {
        id: true,
        status: true,
        checkInAt: true,
        checkOutAt: true,
        pointsEarned: true,
        branch: { select: { name: true } },
        customer: { select: { displayHandle: true } },
        checkInSession: { select: { method: true } },
      },
    }),
    prisma.restaurantVisit.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  const statusColor: Record<string, 'green' | 'gray' | 'red' | 'yellow'> = {
    ACTIVE: 'green',
    COMPLETED: 'gray',
    EXPIRED: 'yellow',
    FLAGGED: 'red',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Visit History" description={`${total} visits total`} />

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-2">
        <select name="branchId" defaultValue={branchId ?? ''}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All branches</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select name="status" defaultValue={status ?? ''}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All statuses</option>
          {['ACTIVE', 'COMPLETED', 'EXPIRED', 'FLAGGED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button type="submit" variant="secondary" size="sm">Filter</Button>
      </form>

      {visits.length === 0 ? (
        <EmptyState title="No visits found" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Check-in</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Check-out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visits.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{v.customer.displayHandle ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{v.branch.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{v.checkInSession?.method?.replace('_', ' ') ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColor[v.status] ?? 'gray'}>{v.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{v.checkInAt.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{v.checkOutAt ? v.checkOutAt.toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex gap-2">
          {page > 1 && <Link href={`?page=${page - 1}${branchId ? `&branchId=${branchId}` : ''}${status ? `&status=${status}` : ''}`}><Button variant="secondary" size="sm">Previous</Button></Link>}
          {page < pages && <Link href={`?page=${page + 1}${branchId ? `&branchId=${branchId}` : ''}${status ? `&status=${status}` : ''}`}><Button variant="secondary" size="sm">Next</Button></Link>}
        </div>
      )}
    </div>
  );
}
