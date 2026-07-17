import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StaffInviteForm } from '@/components/restaurant/StaffInviteForm';

export default async function StaffPage(props: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const { search = '', page: pageStr = '1' } = await props.searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const limit = 20;

  const where = {
    deletedAt: null,
    restaurant: { restaurantGroupId: owner.restaurantGroupId },
    ...(search ? { OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
    ]} : {}),
  };

  const [staffList, total, branches] = await Promise.all([
    prisma.restaurantStaff.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { branchAssignments: { include: { branch: { select: { id: true, name: true } } } } },
    }),
    prisma.restaurantStaff.count({ where }),
    prisma.branch.findMany({
      where: { deletedAt: null, restaurant: { restaurantGroupId: owner.restaurantGroupId } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Staff" description={`${total} staff member${total !== 1 ? 's' : ''}`} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invite form */}
        <div className="lg:col-span-1">
          <StaffInviteForm branches={branches} />
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <form method="GET" className="flex gap-2">
            <input name="search" defaultValue={search} placeholder="Search staff…"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <Button type="submit" variant="secondary" size="sm">Search</Button>
          </form>

          {staffList.length === 0 ? (
            <EmptyState title="No staff yet" description="Invite your first staff member." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Branches</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staffList.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {s.branchAssignments.map((a) => a.branch.name).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.isActive ? 'green' : 'gray'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <RemoveStaffButton staffId={s.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RemoveStaffButton({ staffId }: { staffId: string }) {
  return (
    <form method="POST" action="/api/staff/remove">
      <input type="hidden" name="staffId" value={staffId} />
      <Link href={`?remove=${staffId}`}>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Remove</Button>
      </Link>
    </form>
  );
}
