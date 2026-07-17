import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { BranchForm } from '@/components/restaurant/BranchForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';

export default async function NewBranchPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const restaurants = await prisma.restaurant.findMany({
    where: { restaurantGroupId: owner.restaurantGroupId, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Branch"
        action={<Link href={ROUTES.DASHBOARD_RESTAURANT_BRANCHES}><Button variant="secondary" size="sm">← Back</Button></Link>}
      />
      <BranchForm restaurants={restaurants} />
    </div>
  );
}
