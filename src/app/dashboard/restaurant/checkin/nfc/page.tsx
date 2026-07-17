import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { NfcManager } from '@/components/checkin/NfcManager';

export default async function NfcManagementPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const branches = await prisma.branch.findMany({
    where: { isActive: true, deletedAt: null, restaurant: { restaurantGroupId: owner.restaurantGroupId } },
    select: {
      id: true,
      name: true,
      restaurant: { select: { name: true, settings: { select: { nfcEnabled: true } } } },
      nfcTags: {
        select: { id: true, label: true, isActive: true, registeredAt: true, lastUsedAt: true },
        orderBy: { registeredAt: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="NFC Tag Management"
        description="Register and manage NFC tags for physical check-in"
      />

      {branches.length === 0 ? (
        <EmptyState title="No active branches" />
      ) : (
        <div className="space-y-6">
          {branches.map((b) => (
            <NfcManager
              key={b.id}
              branchId={b.id}
              branchName={b.name}
              restaurantName={b.restaurant.name}
              nfcEnabled={b.restaurant.settings?.nfcEnabled ?? false}
              tags={b.nfcTags}
            />
          ))}
        </div>
      )}
    </div>
  );
}
