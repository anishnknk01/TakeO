'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface SpinConfig {
  isEnabled: boolean;
  eligibility: string;
  minScoreRequired: number;
  dailySpinLimit: number;
}

interface Prize {
  id: string;
  label: string;
  probability: number;
  inventory: number | null;
  isActive: boolean;
  reward: { name: string };
}

interface SpinWheelConfigPanelProps {
  config: SpinConfig | null;
  prizes: Prize[];
  rewards: { id: string; name: string }[];
  restaurantGroupId: string;
}

export function SpinWheelConfigPanel({ config, prizes, rewards, restaurantGroupId }: SpinWheelConfigPanelProps) {
  const [enabled, setEnabled] = useState(config?.isEnabled ?? false);

  async function toggleEnabled() {
    const next = !enabled;
    setEnabled(next);
    await fetch('/api/leaderboard/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantGroupId, chainWideEnabled: false, dailyEnabled: true, weeklyEnabled: true, monthlyEnabled: true, lifetimeEnabled: true, displayTopN: 10 }),
    }).catch(() => null);
    // In a full implementation, this would call a dedicated spin config API
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Spin Wheel</h2>
        <Badge variant={enabled ? 'green' : 'gray'}>{enabled ? 'Enabled' : 'Disabled'}</Badge>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Eligibility: <strong>{config?.eligibility?.replace(/_/g, ' ') ?? 'ONE PER VISIT'}</strong>
        {config?.eligibility === 'MIN_GAME_SCORE' && ` (min score: ${config.minScoreRequired})`}
      </p>

      {/* Prizes */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase">Prizes ({prizes.length})</p>
        {prizes.length === 0 ? (
          <p className="text-sm text-gray-400">No prizes configured. Add prizes via the seed or API.</p>
        ) : (
          prizes.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{p.label}</p>
                <p className="text-xs text-gray-400">{p.reward.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{(p.probability * 100).toFixed(0)}%</span>
                {p.inventory !== null && <Badge variant="gray">×{p.inventory}</Badge>}
                <Badge variant={p.isActive ? 'green' : 'gray'}>{p.isActive ? 'On' : 'Off'}</Badge>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Full prize editor with probability sliders and inventory management coming in the admin tools update.
        For now, manage prizes via the API: POST /api/spin-prizes.
      </p>
    </Card>
  );
}
