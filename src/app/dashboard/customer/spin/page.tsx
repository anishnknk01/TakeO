import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentCustomer } from '@/lib/dal';
import { canCustomerSpin } from '@/lib/rewards';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { SpinWheelWidget } from '@/components/rewards/SpinWheelWidget';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function SpinPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect(ROUTES.AUTH_CUSTOMER_LOGIN);

  const config = await prisma.spinWheelConfig.findUnique({
    where: { restaurantGroupId: customer.restaurantGroupId },
  });

  if (!config?.isEnabled) {
    return (
      <div className="space-y-6">
        <PageHeader title="Spin the Wheel" />
        <EmptyState title="Spin wheel is not active" description="This restaurant hasn't enabled the spin wheel." icon={<span className="text-5xl">🎡</span>} />
      </div>
    );
  }

  const prizes = await prisma.spinWheelPrize.findMany({
    where: { restaurantGroupId: customer.restaurantGroupId, isActive: true, OR: [{ inventory: null }, { inventory: { gt: 0 } }] },
    select: { id: true, label: true, probability: true },
    orderBy: { sortOrder: 'asc' },
  });

  const spinStatus = await canCustomerSpin(customer.id, customer.restaurantGroupId);

  return (
    <div className="space-y-6">
      <PageHeader title="Spin the Wheel" description="Win instant prizes!" />
      <SpinWheelWidget prizes={prizes} canSpin={spinStatus.canSpin} reason={spinStatus.reason} />
    </div>
  );
}
