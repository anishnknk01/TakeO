import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';

export default async function RestaurantOverviewPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const [restaurantCount, branchCount, staffCount, customerCount] = await Promise.all([
    prisma.restaurant.count({ where: { restaurantGroupId: owner.restaurantGroupId, deletedAt: null } }),
    prisma.branch.count({ where: { restaurant: { restaurantGroupId: owner.restaurantGroupId }, deletedAt: null } }),
    prisma.restaurantStaff.count({ where: { restaurant: { restaurantGroupId: owner.restaurantGroupId }, deletedAt: null } }),
    prisma.customer.count({ where: { restaurantGroupId: owner.restaurantGroupId, deletedAt: null } }),
  ]);

  const stats = [
    { label: 'Restaurants', value: restaurantCount, href: ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS },
    { label: 'Branches', value: branchCount, href: ROUTES.DASHBOARD_RESTAURANT_BRANCHES },
    { label: 'Staff', value: staffCount, href: ROUTES.DASHBOARD_RESTAURANT_STAFF },
    { label: 'Customers', value: customerCount, href: ROUTES.DASHBOARD_RESTAURANT_CUSTOMERS },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, {owner.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <a key={s.label} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{s.value}</p>
            </Card>
          </a>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">Active Sessions Today</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">—</p>
          <p className="mt-1 text-xs text-gray-400">Coming in Phase 5 (check-in)</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Games Played Today</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">—</p>
          <p className="mt-1 text-xs text-gray-400">Coming in Phase 6 (games)</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Rewards Issued Today</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">—</p>
          <p className="mt-1 text-xs text-gray-400">Coming in Phase 7 (rewards)</p>
        </Card>
      </div>
    </div>
  );
}
