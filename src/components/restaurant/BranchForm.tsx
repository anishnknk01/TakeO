'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBranchAction, updateBranchAction, deleteBranchAction } from '@/app/actions/restaurant';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';

const TIMEZONES = [
  { value: 'America/New_York', label: 'America/New_York (ET)' },
  { value: 'America/Chicago', label: 'America/Chicago (CT)' },
  { value: 'America/Denver', label: 'America/Denver (MT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PT)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'UTC', label: 'UTC' },
];

interface BranchFormProps {
  restaurants: { id: string; name: string }[];
  branch?: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    country: string;
    timezone: string;
    restaurantId: string;
  };
}

export function BranchForm({ restaurants, branch }: BranchFormProps) {
  const router = useRouter();
  const isEdit = !!branch;
  const action = isEdit ? updateBranchAction : createBranchAction;

  const [state, formAction, isPending] = useActionState(action, {
    success: false as const,
    error: '',
  });

  useEffect(() => {
    if (state.success) router.push(ROUTES.DASHBOARD_RESTAURANT_BRANCHES);
  }, [state.success, router]);

  return (
    <Card className="max-w-lg">
      <form action={formAction} className="space-y-4">
        {isEdit && <input type="hidden" name="id" value={branch.id} />}

        {!isEdit && (
          <Select
            label="Restaurant"
            name="restaurantId"
            required
            placeholder="Select a restaurant"
            options={restaurants.map((r) => ({ value: r.id, label: r.name }))}
            error={'fieldErrors' in state ? state.fieldErrors?.restaurantId?.[0] : undefined}
          />
        )}

        <Input
          label="Branch Name"
          name="name"
          required
          defaultValue={branch?.name}
          placeholder="e.g. Downtown Branch"
          error={'fieldErrors' in state ? state.fieldErrors?.name?.[0] : undefined}
        />

        <Input
          label="Street Address"
          name="address"
          defaultValue={branch?.address ?? ''}
          placeholder="123 Main St"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="City" name="city" defaultValue={branch?.city ?? ''} placeholder="New York" />
          <Input
            label="Country (ISO)"
            name="country"
            defaultValue={branch?.country ?? 'US'}
            placeholder="US"
            maxLength={2}
            hint="2-letter code"
          />
        </div>

        <Select
          label="Timezone"
          name="timezone"
          defaultValue={branch?.timezone ?? 'UTC'}
          options={TIMEZONES}
          error={'fieldErrors' in state ? state.fieldErrors?.timezone?.[0] : undefined}
        />

        {'error' in state && state.error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{state.error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isPending}>
            {isEdit ? 'Save Changes' : 'Create Branch'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push(ROUTES.DASHBOARD_RESTAURANT_BRANCHES)}>
            Cancel
          </Button>
        </div>
      </form>

      {isEdit && (
        <div className="mt-8 border-t border-red-100 pt-6">
          <h3 className="text-sm font-medium text-red-700">Danger Zone</h3>
          <DeleteBranchButton branchId={branch.id} />
        </div>
      )}
    </Card>
  );
}

function DeleteBranchButton({ branchId }: { branchId: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(deleteBranchAction, { success: false as const, error: '' });
  useEffect(() => { if (state.success) router.push(ROUTES.DASHBOARD_RESTAURANT_BRANCHES); }, [state.success, router]);
  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="id" value={branchId} />
      {'error' in state && state.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
      <Button type="submit" variant="danger" size="sm" isLoading={isPending}>Delete Branch</Button>
    </form>
  );
}
