import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentAdmin } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function AdminUsersPage(props: {
  searchParams: Promise<{ search?: string; page?: string; type?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(ROUTES.AUTH_ADMIN_LOGIN);

  const { search = '', page: pageStr = '1', type = 'owners' } = await props.searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const searchFilter = search
    ? { OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ]}
    : {};

  let items: { id: string; name: string | null; email: string; createdAt: Date; deletedAt: Date | null }[] = [];
  let total = 0;

  if (type === 'owners') {
    [items, total] = await Promise.all([
      prisma.restaurantOwner.findMany({ where: { ...searchFilter }, skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, createdAt: true, deletedAt: true } }),
      prisma.restaurantOwner.count({ where: { ...searchFilter } }),
    ]);
  } else if (type === 'staff') {
    [items, total] = await Promise.all([
      prisma.restaurantStaff.findMany({ where: { ...searchFilter }, skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, createdAt: true, deletedAt: true } }),
      prisma.restaurantStaff.count({ where: { ...searchFilter } }),
    ]);
  }

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Restaurant owners and staff" />

      <div className="flex flex-wrap gap-2">
        <Link href={`?type=owners`}><Button variant={type === 'owners' ? 'primary' : 'secondary'} size="sm">Owners</Button></Link>
        <Link href={`?type=staff`}><Button variant={type === 'staff' ? 'primary' : 'secondary'} size="sm">Staff</Button></Link>
      </div>

      <form method="GET" className="flex gap-2">
        <input type="hidden" name="type" value={type} />
        <input name="search" defaultValue={search} placeholder={`Search ${type}…`}
          className="block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <Button type="submit" variant="secondary" size="sm">Search</Button>
      </form>

      {items.length === 0 ? (
        <EmptyState title={`No ${type} found`} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.deletedAt ? <Badge variant="gray">Removed</Badge> : <Badge variant="green">Active</Badge>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex gap-2">
          {page > 1 && <Link href={`?type=${type}&page=${page - 1}`}><Button variant="secondary" size="sm">Previous</Button></Link>}
          {page < pages && <Link href={`?type=${type}&page=${page + 1}`}><Button variant="secondary" size="sm">Next</Button></Link>}
        </div>
      )}
    </div>
  );
}
