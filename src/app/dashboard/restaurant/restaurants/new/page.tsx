import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { RestaurantForm } from '@/components/restaurant/RestaurantForm';
import { PageHeader } from '@/components/ui/PageHeader';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function NewRestaurantPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Restaurant"
        description="Create a new restaurant in your group"
        action={
          <Link href={ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS}>
            <Button variant="secondary" size="sm">← Back</Button>
          </Link>
        }
      />
      <RestaurantForm />
    </div>
  );
}
