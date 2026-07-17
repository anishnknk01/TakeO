'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface AdminLeaderboardActionsProps {
  flagId: string;
  customerId: string;
  restaurantGroupId: string;
}

export function AdminLeaderboardActions({ flagId, customerId, restaurantGroupId }: AdminLeaderboardActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'dismiss' | 'remove' | null>(null);

  async function handle(action: 'dismiss' | 'remove_entries') {
    setLoading(action === 'dismiss' ? 'dismiss' : 'remove');
    await fetch('/api/admin/leaderboard/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagId, action, customerId, restaurantGroupId }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        isLoading={loading === 'dismiss'}
        onClick={() => handle('dismiss')}
      >
        Dismiss
      </Button>
      <Button
        variant="danger"
        size="sm"
        isLoading={loading === 'remove'}
        onClick={() => handle('remove_entries')}
        title="Remove all leaderboard entries for this player"
      >
        Remove
      </Button>
    </div>
  );
}
