'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface QrManagerProps {
  branchId: string;
  branchName: string;
  restaurantName: string;
  currentQr: {
    id: string;
    issuedAt: Date;
    expiresAt: Date;
    useCount: number;
  } | null;
}

export function QrManager({ branchId, branchName, restaurantName, currentQr }: QrManagerProps) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(currentQr?.expiresAt?.toString() ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : true;

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkin/qr-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Failed to generate QR code.');
      } else {
        setToken(data.token);
        setExpiresAt(data.expiresAt);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const checkinUrl = token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/checkin?token=${encodeURIComponent(token)}`
    : null;

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{branchName}</p>
          <p className="text-xs text-gray-400">{restaurantName}</p>
        </div>
        {expiresAt && (
          <Badge variant={isExpired ? 'red' : 'green'}>
            {isExpired ? 'Expired' : 'Active'}
          </Badge>
        )}
      </div>

      {expiresAt && !isExpired && (
        <p className="text-xs text-gray-500">
          Expires: {new Date(expiresAt).toLocaleString()}
        </p>
      )}

      {token && checkinUrl && (
        <div className="rounded-lg bg-gray-50 p-3 space-y-2">
          <p className="text-xs font-medium text-gray-600">Check-in URL</p>
          <p className="break-all text-xs text-brand-700 font-mono">{checkinUrl}</p>
          <p className="text-xs text-gray-400">
            Display this as a QR code using any QR generator. The token expires automatically.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={generate} isLoading={loading} size="sm" className="w-full">
        {token || (currentQr && !isExpired) ? 'Regenerate QR' : 'Generate QR'}
      </Button>
    </Card>
  );
}
