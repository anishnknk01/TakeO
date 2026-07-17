'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Config {
  chainWideEnabled: boolean;
  dailyEnabled: boolean;
  weeklyEnabled: boolean;
  monthlyEnabled: boolean;
  lifetimeEnabled: boolean;
  displayTopN: number;
}

interface LeaderboardConfigFormProps {
  config: Config | null;
  restaurantGroupId: string;
}

export function LeaderboardConfigForm({ config, restaurantGroupId }: LeaderboardConfigFormProps) {
  const [state, setState] = useState<Config>({
    chainWideEnabled: config?.chainWideEnabled ?? false,
    dailyEnabled: config?.dailyEnabled ?? true,
    weeklyEnabled: config?.weeklyEnabled ?? true,
    monthlyEnabled: config?.monthlyEnabled ?? true,
    lifetimeEnabled: config?.lifetimeEnabled ?? true,
    displayTopN: config?.displayTopN ?? 10,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch('/api/leaderboard/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantGroupId, ...state }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggle(key: keyof Config) {
    setState((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-gray-900">Leaderboard Settings</h2>
      <div className="space-y-3">
        {([
          { key: 'dailyEnabled', label: 'Daily leaderboard' },
          { key: 'weeklyEnabled', label: 'Weekly leaderboard' },
          { key: 'monthlyEnabled', label: 'Monthly leaderboard' },
          { key: 'lifetimeEnabled', label: 'All-time leaderboard' },
          { key: 'chainWideEnabled', label: 'Chain-wide board (chains only)' },
        ] as { key: keyof Config; label: string }[]).map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between gap-3 text-sm text-gray-700">
            <span>{label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={state[key] as boolean}
              onClick={() => toggle(key)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                state[key] ? 'bg-brand-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 translate-y-0.5 transform rounded-full bg-white shadow transition-transform ${
                state[key] ? 'translate-x-4.5' : 'translate-x-0.5'
              }`} />
            </button>
          </label>
        ))}

        <div>
          <label className="text-xs text-gray-500 block mb-1">Display top N players</label>
          <input
            type="number"
            min={3}
            max={100}
            value={state.displayTopN}
            onChange={(e) => setState((prev) => ({ ...prev, displayTopN: parseInt(e.target.value, 10) || 10 }))}
            className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <Button size="sm" className="w-full" onClick={save} isLoading={saving}>
          {saved ? '✓ Saved' : 'Save Settings'}
        </Button>
      </div>
    </Card>
  );
}
