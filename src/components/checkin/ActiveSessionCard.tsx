'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ActiveSessionCardProps {
  visitId: string;
  branchName: string;
  restaurantName: string;
  checkInAt: Date;
  expiresAt: Date | null;
  method: string | null;
}

export function ActiveSessionCard({
  visitId,
  branchName,
  restaurantName,
  checkInAt,
  expiresAt,
  method,
}: ActiveSessionCardProps) {
  const router = useRouter();
  const [minsLeft, setMinsLeft] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    function calc() {
      if (!expiresAt) return;
      const ms = new Date(expiresAt).getTime() - Date.now();
      setMinsLeft(Math.max(0, Math.floor(ms / 60000)));
    }
    calc();
    const t = setInterval(calc, 30000);
    return () => clearInterval(t);
  }, [expiresAt]);

  async function checkout() {
    setChecking(true);
    try {
      await fetch('/api/checkin/checkout', { method: 'POST' });
      router.refresh();
    } finally {
      setChecking(false);
    }
  }

  const isExpiringSoon = minsLeft !== null && minsLeft < 30;

  return (
    <Card className="border-green-200 bg-green-50">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="green">Active Session</Badge>
            {method && (
              <Badge variant="blue">{method.replace('_', ' ')}</Badge>
            )}
          </div>
          <p className="font-semibold text-gray-900">{restaurantName} — {branchName}</p>
          <p className="text-xs text-gray-500">
            Checked in at {new Date(checkInAt).toLocaleTimeString()}
          </p>
          {minsLeft !== null && (
            <p className={`text-sm font-medium ${isExpiringSoon ? 'text-orange-600' : 'text-green-700'}`}>
              {minsLeft > 0 ? `${minsLeft} minutes remaining` : 'Session expiring…'}
            </p>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={checkout} isLoading={checking}>
          Check out
        </Button>
      </div>
    </Card>
  );
}
