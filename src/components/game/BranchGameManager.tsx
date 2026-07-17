'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CatalogGame {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  difficulty: number;
  category: { name: string };
}

interface ActiveGame {
  id: string;
  isActive: boolean;
  isFeatured: boolean;
  maxPlaysPerDay: number | null;
  scoreMultiplier: number;
  sortOrder: number;
  game: CatalogGame & { status: string };
}

interface Branch {
  id: string;
  name: string;
  restaurant: { name: string };
  restaurantGames: ActiveGame[];
}

interface BranchGameManagerProps {
  branch: Branch;
  catalogGames: CatalogGame[];
}

const DIFFICULTY_LABELS = ['', 'Easy', 'Normal', 'Medium', 'Hard', 'Expert'];

export function BranchGameManager({ branch, catalogGames }: BranchGameManagerProps) {
  const [activeGames, setActiveGames] = useState<ActiveGame[]>(branch.restaurantGames);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [multiplierEdit, setMultiplierEdit] = useState<Record<string, string>>({});

  const enabledIds = new Set(activeGames.filter((ag) => ag.isActive).map((ag) => ag.game.id));
  const notEnabled = catalogGames.filter((g) => !enabledIds.has(g.id));

  async function addGame(gameId: string) {
    setAddingId(gameId);
    try {
      const res = await fetch('/api/restaurant-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId: branch.id, gameId, scoreMultiplier: 1.0 }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveGames((prev) => [...prev, data]);
      }
    } finally {
      setAddingId(null);
    }
  }

  async function removeGame(gameId: string) {
    setRemovingId(gameId);
    try {
      await fetch(`/api/restaurant-games?branchId=${branch.id}&gameId=${gameId}`, { method: 'DELETE' });
      setActiveGames((prev) => prev.map((ag) => ag.game.id === gameId ? { ...ag, isActive: false } : ag));
    } finally {
      setRemovingId(null);
    }
  }

  async function updateMultiplier(gameId: string) {
    const val = parseFloat(multiplierEdit[gameId] ?? '1');
    if (isNaN(val) || val < 0.1 || val > 10) return;
    await fetch('/api/restaurant-games', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId: branch.id, gameId, scoreMultiplier: val }),
    });
    setActiveGames((prev) => prev.map((ag) => ag.game.id === gameId ? { ...ag, scoreMultiplier: val } : ag));
  }

  return (
    <Card>
      <div className="mb-4">
        <p className="font-semibold text-gray-900">{branch.name}</p>
        <p className="text-xs text-gray-400">{branch.restaurant.name}</p>
      </div>

      {/* Active games */}
      {activeGames.filter((ag) => ag.isActive).length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Games</p>
          {activeGames.filter((ag) => ag.isActive).map((ag) => (
            <div key={ag.game.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">{ag.game.name}</p>
                <p className="text-xs text-gray-400">{ag.game.category.name} · {DIFFICULTY_LABELS[ag.game.difficulty]}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Multiplier:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  defaultValue={ag.scoreMultiplier}
                  onChange={(e) => setMultiplierEdit((prev) => ({ ...prev, [ag.game.id]: e.target.value }))}
                  onBlur={() => updateMultiplier(ag.game.id)}
                  className="w-16 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Badge variant="green">Active</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  isLoading={removingId === ag.game.id}
                  onClick={() => removeGame(ag.game.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Catalog — not yet enabled */}
      {notEnabled.length > 0 && (
        <div className="space-y-2 border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Add from Catalog</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {notEnabled.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">{g.name}</p>
                  <p className="text-xs text-gray-400">{g.category.name}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={addingId === g.id}
                  onClick={() => addGame(g.id)}
                >
                  Enable
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeGames.filter((ag) => ag.isActive).length === 0 && notEnabled.length === 0 && (
        <p className="text-sm text-gray-400">No games in the catalog yet. Ask your platform admin to add games.</p>
      )}
    </Card>
  );
}
