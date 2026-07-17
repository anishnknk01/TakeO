'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Prize { id: string; label: string; probability: number; }
interface SpinResult { prizeLabel: string; rewardName: string; redemptionCode: string; }

export function SpinWheelWidget({
  prizes,
  canSpin,
  reason,
}: {
  prizes: Prize[];
  canSpin: boolean;
  reason?: string;
}) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  async function handleSpin() {
    setSpinning(true);
    setResult(null);
    setError(null);

    // Animate spin (random extra rotations)
    const extraRotations = 5 + Math.floor(Math.random() * 5);
    setRotation((prev) => prev + 360 * extraRotations);

    try {
      const res = await fetch('/api/rewards/spin', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Spin failed.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSpinning(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      {/* Wheel visualization */}
      <div className="relative mx-auto h-64 w-64">
        <div
          className="absolute inset-0 rounded-full border-8 border-brand-200 bg-gradient-to-br from-brand-50 to-brand-100 shadow-lg transition-transform duration-[3000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Prize segments (simplified visual) */}
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white/80 p-4">
            <span className="text-4xl">🎡</span>
            <p className="mt-2 text-xs text-gray-500">
              {prizes.length} prizes available
            </p>
          </div>
        </div>
        {/* Pointer */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">▼</div>
      </div>

      {/* Prize list */}
      <div className="flex flex-wrap justify-center gap-2">
        {prizes.map((p) => (
          <span key={p.id} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 font-medium">
            {p.label}
          </span>
        ))}
      </div>

      {/* Spin button */}
      {canSpin ? (
        <Button onClick={handleSpin} isLoading={spinning} size="lg" className="w-full max-w-xs mx-auto">
          {spinning ? 'Spinning…' : '🎰 Spin Now!'}
        </Button>
      ) : (
        <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
          {reason ?? 'You cannot spin right now.'}
        </div>
      )}

      {/* Result */}
      {result && (
        <Card className="border-green-200 bg-green-50 text-center">
          <p className="text-lg font-bold text-green-800">🎉 You won!</p>
          <p className="mt-1 text-base font-semibold text-gray-900">{result.prizeLabel}</p>
          <p className="text-sm text-gray-600">{result.rewardName}</p>
          <div className="mt-3 rounded-lg bg-white px-4 py-2 text-center">
            <p className="text-xs text-gray-400">Redemption Code</p>
            <p className="text-lg font-mono font-bold text-brand-700 tracking-wider">{result.redemptionCode}</p>
          </div>
          <p className="mt-2 text-xs text-gray-400">Show this code to staff to claim your reward</p>
        </Card>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
