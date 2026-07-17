import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { BranchForm } from '@/components/restaurant/BranchForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';

export default async function EditBranchPage(props: { params: Promise<{ id: string }> }) {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const { id } = await props.params;

  const [branch, restaurants] = await Promise.all([
    prisma.branch.findFirst({
      where: { id, deletedAt: null, restaurant: { restaurantGroupId: owner.restaurantGroupId } },
      select: { id: true, name: true, address: true, city: true, country: true, timezone: true, restaurantId: true },
    }),
    prisma.restaurant.findMany({
      where: { restaurantGroupId: owner.restaurantGroupId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!branch) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Branch"
        description={`Editing: ${branch.name}`}
        action={<Link href={ROUTES.DASHBOARD_RESTAURANT_BRANCHES}><Button variant="secondary" size="sm">← Back</Button></Link>}
      />
      <BranchForm restaurants={restaurants} branch={branch} />
    </div>
  );
}
