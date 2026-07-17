'use client';

import { useActionState } from 'react';
import { inviteStaffAction } from '@/app/actions/restaurant';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';

interface StaffInviteFormProps {
  branches: { id: string; name: string }[];
}

export function StaffInviteForm({ branches }: StaffInviteFormProps) {
  const [state, formAction, isPending] = useActionState(inviteStaffAction, {
    success: false as const,
    error: '',
  });

  // Reset form on success by using key, but we use a simple success message instead
  const showSuccess = state.success;

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-gray-900">Invite Staff Member</h2>
      <form action={formAction} className="space-y-3">
        <Input
          label="Name"
          name="name"
          required
          placeholder="Jane Smith"
          error={'fieldErrors' in state ? state.fieldErrors?.name?.[0] : undefined}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="jane@restaurant.com"
          error={'fieldErrors' in state ? state.fieldErrors?.email?.[0] : undefined}
        />
        <Select
          label="Assign to Branch"
          name="branchId"
          required
          placeholder="Select a branch"
          options={branches.map((b) => ({ value: b.id, label: b.name }))}
          error={'fieldErrors' in state ? state.fieldErrors?.branchId?.[0] : undefined}
        />

        {'error' in state && state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        {showSuccess && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Staff member invited!</p>
        )}

        <Button type="submit" className="w-full" isLoading={isPending} size="sm">
          Invite Staff
        </Button>
      </form>
    </Card>
  );
}
