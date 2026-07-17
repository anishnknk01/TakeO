import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentAdmin } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';

export default async function AdminOverviewPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(ROUTES.AUTH_ADMIN_LOGIN);

  const [groupCount, restaurantCount, branchCount, customerCount] = await Promise.all([
    prisma.restaurantGroup.count({ where: { deletedAt: null } }),
    prisma.restaurant.count({ where: { deletedAt: null } }),
    prisma.branch.count({ where: { deletedAt: null } }),
    prisma.customer.count({ where: { deletedAt: null } }),
  ]);

  const stats = [
    { label: 'Restaurant Groups', value: groupCount, href: ROUTES.DASHBOARD_ADMIN_GROUPS },
    { label: 'Restaurants', value: restaurantCount, href: ROUTES.DASHBOARD_ADMIN_RESTAURANTS },
    { label: 'Branches', value: branchCount, href: ROUTES.DASHBOARD_ADMIN_RESTAURANTS },
    { label: 'Customers', value: customerCount, href: ROUTES.DASHBOARD_ADMIN_USERS },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Logged in as {admin.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
