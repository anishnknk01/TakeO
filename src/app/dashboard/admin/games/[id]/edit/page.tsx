import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentAdmin } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { AdminGameForm } from '@/components/game/AdminGameForm';

export default async function EditGamePage(props: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(ROUTES.AUTH_ADMIN_LOGIN);

  const { id } = await props.params;

  const [game, categories] = await Promise.all([
    prisma.game.findFirst({ where: { id, deletedAt: null } }),
    prisma.gameCategory.findMany({ select: { id: true, name: true, type: true }, orderBy: { sortOrder: 'asc' } }),
  ]);

  if (!game) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Game"
        description={game.name}
        action={<Link href={ROUTES.DASHBOARD_ADMIN_GAMES}><Button variant="secondary" size="sm">← Back</Button></Link>}
      />
      <AdminGameForm
        categories={categories}
        game={{
          id: game.id,
          name: game.name,
          slug: game.slug,
          description: game.description,
          thumbnailUrl: game.thumbnailUrl,
          bundleUrl: game.bundleUrl,
          version: game.version,
          categoryId: game.categoryId,
          difficulty: game.difficulty,
          estimatedPlaySecs: game.estimatedPlaySecs,
          maxScore: game.maxScore,
          minDurationSecs: game.minDurationSecs,
          pointsPerScore: game.pointsPerScore,
          status: game.status,
        }}
      />
    </div>
  );
}
