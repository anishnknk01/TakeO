'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface RedeemFormProps {
  branches: { id: string; name: string }[];
}

interface RedeemResult {
  rewardName: string;
  rewardType: string;
  value: number | null;
}

export function RedeemForm({ branches }: RedeemFormProps) {
  const [code, setCode] = useState('');
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !branchId) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redemptionCode: code.trim().toUpperCase(), branchId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? data.error ?? 'Redemption failed.');
      } else {
        setResult(data);
        setCode('');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-gray-900">Enter Reward Code</h2>
      <form onSubmit={handleRedeem} className="space-y-4">
        <Select
          label="Branch"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          options={branches.map((b) => ({ value: b.id, label: b.name }))}
        />

        <Input
          label="Redemption Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. BRGRLAB1"
          required
          className="font-mono text-lg tracking-wider"
        />

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {result && (
          <div className="rounded-lg bg-green-50 px-4 py-3 space-y-1 text-center">
            <p className="text-lg font-bold text-green-800">✓ Redeemed Successfully</p>
            <p className="text-sm font-medium text-gray-900">{result.rewardName}</p>
            <Badge variant="green">{result.rewardType.replace(/_/g, ' ')}</Badge>
            {result.value !== null && (
              <p className="text-xs text-gray-500">Value: {result.value}</p>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={loading} disabled={!code.trim()}>
          Redeem
        </Button>
      </form>
    </Card>
  );
}
