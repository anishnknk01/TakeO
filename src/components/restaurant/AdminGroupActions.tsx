'use client';

import { useActionState } from 'react';
import { adminSuspendRestaurantGroupAction, adminRestoreRestaurantGroupAction } from '@/app/actions/restaurant';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function AdminGroupActions({ groupId, isSuspended }: { groupId: string; isSuspended: boolean }) {
  const [suspendState, suspendAction, suspendPending] = useActionState(adminSuspendRestaurantGroupAction, {
    success: false as const,
    error: '',
  });
  const [restoreState, restoreAction, restorePending] = useActionState(adminRestoreRestaurantGroupAction, {
    success: false as const,
    error: '',
  });

  return (
    <Card className="border-red-100">
      <h2 className="mb-3 text-sm font-semibold text-red-700">Admin Actions</h2>

      {'error' in suspendState && suspendState.error && (
        <p className="mb-2 text-sm text-red-600">{suspendState.error}</p>
      )}
      {'error' in restoreState && restoreState.error && (
        <p className="mb-2 text-sm text-red-600">{restoreState.error}</p>
      )}

      {isSuspended ? (
        <form action={restoreAction}>
          <input type="hidden" name="groupId" value={groupId} />
          <Button type="submit" variant="secondary" size="sm" isLoading={restorePending}>
            Restore Group
          </Button>
        </form>
      ) : (
        <form action={suspendAction}>
          <input type="hidden" name="groupId" value={groupId} />
          <Button type="submit" variant="danger" size="sm" isLoading={suspendPending}>
            Suspend Group
          </Button>
        </form>
      )}
    </Card>
  );
}
