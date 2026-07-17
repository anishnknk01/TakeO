'use client';

import { useActionState } from 'react';
import { adminCreateRestaurantGroupAction } from '@/app/actions/restaurant';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function AdminCreateGroupForm() {
  const [state, formAction, isPending] = useActionState(adminCreateRestaurantGroupAction, {
    success: false as const,
    error: '',
  });

  return (
    <Card className="max-w-lg">
      <form action={formAction} className="space-y-4">
        <Input
          label="Group / Chain Name"
          name="name"
          required
          placeholder="e.g. Taco Fiesta Chain"
          error={'fieldErrors' in state ? state.fieldErrors?.name?.[0] : undefined}
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isChain" value="true"
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          This is a chain (multiple restaurants/branches)
        </label>

        <div className="border-t border-gray-100 pt-4">
          <p className="mb-3 text-sm font-medium text-gray-700">Owner Account</p>
          <div className="space-y-3">
            <Input
              label="Owner Name"
              name="ownerName"
              required
              placeholder="Alice Owner"
              error={'fieldErrors' in state ? state.fieldErrors?.ownerName?.[0] : undefined}
            />
            <Input
              label="Owner Email"
              name="ownerEmail"
              type="email"
              required
              placeholder="alice@restaurant.com"
              error={'fieldErrors' in state ? state.fieldErrors?.ownerEmail?.[0] : undefined}
            />
          </div>
        </div>

        {'error' in state && state.error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{state.error}</p>
        )}

        <Button type="submit" isLoading={isPending} className="w-full">Create Restaurant Group</Button>
      </form>
    </Card>
  );
}
