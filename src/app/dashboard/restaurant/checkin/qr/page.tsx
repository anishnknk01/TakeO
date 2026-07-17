import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { QrManager } from '@/components/checkin/QrManager';

export default async function QrManagementPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const branches = await prisma.branch.findMany({
    where: { isActive: true, deletedAt: null, restaurant: { restaurantGroupId: owner.restaurantGroupId } },
    select: {
      id: true,
      name: true,
      restaurant: { select: { name: true } },
      qrCodes: {
        where: { isActive: true, expiresAt: { gt: new Date() } },
        select: { id: true, issuedAt: true, expiresAt: true, useCount: true },
        orderBy: { issuedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Code Management"
        description="Generate dynamic QR tokens for customer check-in"
      />

      {branches.length === 0 ? (
        <EmptyState title="No active branches" description="Create and activate branches first." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <QrManager
              key={b.id}
              branchId={b.id}
              branchName={b.name}
              restaurantName={b.restaurant.name}
              currentQr={b.qrCodes[0] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
