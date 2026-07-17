'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createRestaurantAction, updateRestaurantAction, deleteRestaurantAction } from '@/app/actions/restaurant';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';

interface RestaurantFormProps {
  restaurant?: {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
  };
}

export function RestaurantForm({ restaurant }: RestaurantFormProps) {
  const router = useRouter();
  const isEdit = !!restaurant;

  const action = isEdit ? updateRestaurantAction : createRestaurantAction;
  const [state, formAction, isPending] = useActionState(action, {
    success: false as const,
    error: '',
  });

  useEffect(() => {
    if (state.success) {
      router.push(ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS);
    }
  }, [state.success, router]);

  return (
    <Card className="max-w-lg">
      <form action={formAction} className="space-y-4">
        {isEdit && <input type="hidden" name="id" value={restaurant.id} />}

        <Input
          label="Restaurant Name"
          name="name"
          required
          defaultValue={restaurant?.name}
          placeholder="e.g. The Burger Lab — Downtown"
          error={'fieldErrors' in state ? state.fieldErrors?.name?.[0] : undefined}
        />

        <Textarea
          label="Description"
          name="description"
          defaultValue={restaurant?.description ?? ''}
          placeholder="Brief description of your restaurant (optional)"
          error={'fieldErrors' in state ? state.fieldErrors?.description?.[0] : undefined}
        />

        <Input
          label="Logo URL"
          name="logoUrl"
          type="url"
          defaultValue={restaurant?.logoUrl ?? ''}
          placeholder="https://example.com/logo.png"
          hint="Paste a URL to your logo image"
          error={'fieldErrors' in state ? state.fieldErrors?.logoUrl?.[0] : undefined}
        />

        {'error' in state && state.error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" isLoading={isPending}>
            {isEdit ? 'Save Changes' : 'Create Restaurant'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS)}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Delete section */}
      {isEdit && (
        <div className="mt-8 border-t border-red-100 pt-6">
          <h3 className="text-sm font-medium text-red-700">Danger Zone</h3>
          <p className="mt-1 text-xs text-gray-500">
            Deleting a restaurant is permanent once all branches are removed.
          </p>
          <DeleteRestaurantButton restaurantId={restaurant.id} />
        </div>
      )}
    </Card>
  );
}

function DeleteRestaurantButton({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(deleteRestaurantAction, {
    success: false as const,
    error: '',
  });

  useEffect(() => {
    if (state.success) router.push(ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS);
  }, [state.success, router]);

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="id" value={restaurantId} />
      {'error' in state && state.error && (
        <p className="mb-2 text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" variant="danger" size="sm" isLoading={isPending}>
        Delete Restaurant
      </Button>
    </form>
  );
}
