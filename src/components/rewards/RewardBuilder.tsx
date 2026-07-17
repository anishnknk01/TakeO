'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';

const REWARD_TYPES = [
  { value: 'DISCOUNT_PERCENT', label: 'Discount (%)' },
  { value: 'DISCOUNT_FIXED', label: 'Discount (Fixed)' },
  { value: 'FREE_ITEM', label: 'Free Item' },
  { value: 'BUY_ONE_GET_ONE', label: 'Buy 1 Get 1' },
  { value: 'POINTS_MULTIPLIER', label: 'Points Multiplier' },
  { value: 'CASHBACK', label: 'Cashback' },
  { value: 'GIFT_VOUCHER', label: 'Gift Voucher' },
  { value: 'MYSTERY', label: 'Mystery Reward' },
];

export function RewardBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name'),
      type: fd.get('type'),
      value: fd.get('value') ? parseFloat(fd.get('value') as string) : null,
      inventory: fd.get('inventory') ? parseInt(fd.get('inventory') as string, 10) : null,
      description: fd.get('description') || undefined,
    };

    try {
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? data.error ?? 'Failed to create reward.');
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Create Reward</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input name="name" label="Name" required placeholder="10% Off Next Meal" />
        <Select name="type" label="Type" required options={REWARD_TYPES} />
        <div className="grid grid-cols-2 gap-3">
          <Input name="value" label="Value" type="number" step="0.01" placeholder="e.g. 10" hint="% or amount" />
          <Input name="inventory" label="Stock" type="number" min={0} placeholder="∞ if empty" hint="Leave empty for unlimited" />
        </div>
        <Input name="description" label="Description" placeholder="Short description (optional)" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Reward created!</p>}
        <Button type="submit" size="sm" className="w-full" isLoading={loading}>Create Reward</Button>
      </form>
    </Card>
  );
}
