import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SettingsForm } from '@/components/restaurant/SettingsForm';

export default async function SettingsPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const restaurants = await prisma.restaurant.findMany({
    where: { restaurantGroupId: owner.restaurantGroupId, deletedAt: null },
    include: { settings: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure per-restaurant options" />

      {restaurants.length === 0 ? (
        <EmptyState title="No restaurants" description="Create a restaurant first before configuring settings." />
      ) : (
        <div className="space-y-6">
          {restaurants.map((r) => (
            <SettingsForm key={r.id} restaurant={r} settings={r.settings} />
          ))}
        </div>
      )}
    </div>
  );
}
