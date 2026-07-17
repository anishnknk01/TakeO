'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

interface Category { id: string; name: string; type: string; }

interface AdminGameFormProps {
  categories: Category[];
  game?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    thumbnailUrl: string | null;
    bundleUrl: string;
    version: string;
    categoryId: string;
    difficulty: number;
    estimatedPlaySecs: number;
    maxScore: number;
    minDurationSecs: number;
    pointsPerScore: number;
    status: string;
  };
}

export function AdminGameForm({ categories, game }: AdminGameFormProps) {
  const router = useRouter();
  const isEdit = !!game;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name'),
      slug: fd.get('slug'),
      description: fd.get('description') || undefined,
      thumbnailUrl: fd.get('thumbnailUrl') || undefined,
      bundleUrl: fd.get('bundleUrl'),
      version: fd.get('version'),
      categoryId: fd.get('categoryId'),
      difficulty: parseInt(fd.get('difficulty') as string, 10),
      estimatedPlaySecs: parseInt(fd.get('estimatedPlaySecs') as string, 10),
      maxScore: parseInt(fd.get('maxScore') as string, 10),
      minDurationSecs: parseInt(fd.get('minDurationSecs') as string, 10),
      pointsPerScore: parseFloat(fd.get('pointsPerScore') as string),
      ...(isEdit ? { status: fd.get('status') } : {}),
    };

    const url = isEdit ? `/api/admin/games/${game.id}` : '/api/admin/games';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? data.error ?? 'Failed to save game.');
      } else {
        router.push(ROUTES.DASHBOARD_ADMIN_GAMES);
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Game Name" name="name" required defaultValue={game?.name} placeholder="e.g. Burger Stack" />
          <Input label="Slug" name="slug" required defaultValue={game?.slug} placeholder="burger-stack"
            hint="Lowercase, hyphens only" />
        </div>

        <Textarea label="Description" name="description" defaultValue={game?.description ?? ''} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Bundle URL" name="bundleUrl" type="url" required defaultValue={game?.bundleUrl}
            placeholder="https://cdn.playbite.io/games/burger-stack/index.html" />
          <Input label="Thumbnail URL" name="thumbnailUrl" type="url" defaultValue={game?.thumbnailUrl ?? ''} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Category"
            name="categoryId"
            required
            defaultValue={game?.categoryId}
            placeholder="Select category"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Select
            label="Difficulty"
            name="difficulty"
            defaultValue={String(game?.difficulty ?? 2)}
            options={[
              { value: '1', label: '1 — Easy' },
              { value: '2', label: '2 — Normal' },
              { value: '3', label: '3 — Medium' },
              { value: '4', label: '4 — Hard' },
              { value: '5', label: '5 — Expert' },
            ]}
          />
          <Input label="Version" name="version" defaultValue={game?.version ?? '1.0.0'} placeholder="1.0.0" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Max Score" name="maxScore" type="number" min={1} required defaultValue={game?.maxScore ?? 10000} />
          <Input label="Min Duration (sec)" name="minDurationSecs" type="number" min={1} required defaultValue={game?.minDurationSecs ?? 5} />
          <Input label="Est. Play Time (sec)" name="estimatedPlaySecs" type="number" min={5} required defaultValue={game?.estimatedPlaySecs ?? 60} />
          <Input label="Points per Score" name="pointsPerScore" type="number" step="0.01" min={0.01} required defaultValue={game?.pointsPerScore ?? 1} />
        </div>

        {isEdit && (
          <Select
            label="Status"
            name="status"
            defaultValue={game.status}
            options={[
              { value: 'PENDING_REVIEW', label: 'Pending Review' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
          />
        )}

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={loading}>
            {isEdit ? 'Save Changes' : 'Create Game'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push(ROUTES.DASHBOARD_ADMIN_GAMES)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
