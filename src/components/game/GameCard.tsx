'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GamePlayer } from './GamePlayer';

interface GameCardProps {
  restaurantGame: {
    id: string;
    isFeatured: boolean;
    maxPlaysPerDay: number | null;
    scoreMultiplier: number;
    game: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      thumbnailUrl: string | null;
      difficulty: number;
      estimatedPlaySecs: number;
      maxScore: number;
      version: string;
      category: { name: string; type: string };
    };
  };
}

const DIFFICULTY_LABELS = ['', 'Easy', 'Normal', 'Medium', 'Hard', 'Expert'];
const DIFFICULTY_COLORS: Record<number, 'green' | 'blue' | 'yellow' | 'red' | 'purple'> = {
  1: 'green',
  2: 'blue',
  3: 'yellow',
  4: 'red',
  5: 'purple',
};

function formatDuration(secs: number): string {
  if (secs < 60) return `${secs}s`;
  return `${Math.round(secs / 60)}m`;
}

export function GameCard({ restaurantGame }: GameCardProps) {
  const { game, scoreMultiplier } = restaurantGame;
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <GamePlayer
        gameId={game.id}
        gameName={game.name}
        onClose={() => setPlaying(false)}
      />
    );
  }

  return (
    <Card className="flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="h-32 w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
        {game.thumbnailUrl ? (
          <img src={game.thumbnailUrl} alt={game.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl">🎮</span>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900 leading-tight">{game.name}</p>
          {scoreMultiplier > 1 && (
            <Badge variant="purple">{scoreMultiplier}×</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="gray">{game.category.name}</Badge>
          <Badge variant={DIFFICULTY_COLORS[game.difficulty] ?? 'gray'}>
            {DIFFICULTY_LABELS[game.difficulty] ?? 'Unknown'}
          </Badge>
          <Badge variant="gray">{formatDuration(game.estimatedPlaySecs)}</Badge>
        </div>

        {game.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{game.description}</p>
        )}
      </div>

      <Button
        onClick={() => setPlaying(true)}
        size="sm"
        className="w-full"
      >
        Play Now
      </Button>
    </Card>
  );
}
