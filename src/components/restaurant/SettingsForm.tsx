'use client';

import { useActionState } from 'react';
import { updateSettingsAction } from '@/app/actions/restaurant';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface SettingsFormProps {
  restaurant: { id: string; name: string };
  settings: {
    maxSessionMinutes: number;
    maxPlaysPerDay: number;
    maxPointsPerDay: number;
    qrRotationMinutes: number;
    nfcEnabled: boolean;
    wifiEnabled: boolean;
    beaconEnabled: boolean;
  } | null;
}

export function SettingsForm({ restaurant, settings }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateSettingsAction, {
    success: false as const,
    error: '',
  });

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-gray-900">{restaurant.name}</h2>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="restaurantId" value={restaurant.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Max Session (minutes)"
            name="maxSessionMinutes"
            type="number"
            min={15}
            max={480}
            defaultValue={settings?.maxSessionMinutes ?? 360}
            hint="15–480 minutes"
          />
          <Input
            label="Max Game Plays / Day"
            name="maxPlaysPerDay"
            type="number"
            min={1}
            max={100}
            defaultValue={settings?.maxPlaysPerDay ?? 10}
          />
          <Input
            label="Max Points / Day"
            name="maxPointsPerDay"
            type="number"
            min={100}
            max={50000}
            defaultValue={settings?.maxPointsPerDay ?? 5000}
          />
          <Input
            label="QR Rotation (minutes)"
            name="qrRotationMinutes"
            type="number"
            min={5}
            max={1440}
            defaultValue={settings?.qrRotationMinutes ?? 60}
            hint="5–1440 minutes"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Check-in Methods</p>
          <div className="flex flex-wrap gap-4">
            {[
              { name: 'nfcEnabled', label: 'NFC', checked: settings?.nfcEnabled ?? false },
              { name: 'wifiEnabled', label: 'Wi-Fi', checked: settings?.wifiEnabled ?? false },
              { name: 'beaconEnabled', label: 'Bluetooth Beacon', checked: settings?.beaconEnabled ?? false },
            ].map((opt) => (
              <label key={opt.name} className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name={opt.name}
                  value="true"
                  defaultChecked={opt.checked}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400">QR code is always enabled. NFC, Wi-Fi, and Beacon are optional add-ons.</p>
        </div>

        {'error' in state && state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        {state.success && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Settings saved.</p>
        )}

        <Button type="submit" size="sm" isLoading={isPending}>Save Settings</Button>
      </form>
    </Card>
  );
}
