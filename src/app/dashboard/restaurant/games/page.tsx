import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { BranchGameManager } from '@/components/game/BranchGameManager';

export default async function RestaurantGamesPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const [branches, catalogGames] = await Promise.all([
    prisma.branch.findMany({
      where: { isActive: true, deletedAt: null, restaurant: { restaurantGroupId: owner.restaurantGroupId } },
      select: {
        id: true,
        name: true,
        restaurant: { select: { name: true } },
        restaurantGames: {
          select: {
            id: true, isActive: true, isFeatured: true, maxPlaysPerDay: true,
            scoreMultiplier: true, sortOrder: true,
            game: { select: { id: true, name: true, slug: true, status: true, thumbnailUrl: true, difficulty: true, category: { select: { name: true } } } },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.game.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { id: true, name: true, slug: true, thumbnailUrl: true, difficulty: true, category: { select: { name: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Game Management"
        description="Enable and configure games for each branch"
      />

      {branches.length === 0 ? (
        <EmptyState title="No active branches" description="Create and activate branches first." />
      ) : (
        <div className="space-y-6">
          {branches.map((b) => (
            <BranchGameManager
              key={b.id}
              branch={b}
              catalogGames={catalogGames}
            />
          ))}
        </div>
      )}
    </div>
  );
}
