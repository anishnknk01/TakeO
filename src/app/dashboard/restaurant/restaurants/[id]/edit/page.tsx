import { notFound, redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { RestaurantForm } from '@/components/restaurant/RestaurantForm';
import { PageHeader } from '@/components/ui/PageHeader';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function EditRestaurantPage(props: {
  params: Promise<{ id: string }>;
}) {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const { id } = await props.params;

  const restaurant = await prisma.restaurant.findFirst({
    where: { id, restaurantGroupId: owner.restaurantGroupId, deletedAt: null },
    select: { id: true, name: true, description: true, logoUrl: true },
  });
  if (!restaurant) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Restaurant"
        description={`Editing: ${restaurant.name}`}
        action={
          <Link href={ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS}>
            <Button variant="secondary" size="sm">← Back</Button>
          </Link>
        }
      />
      <RestaurantForm restaurant={restaurant} />
    </div>
  );
}
