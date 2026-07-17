import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentCustomer } from '@/lib/dal';
import { getActiveVisit } from '@/lib/checkin';
import { getAvailableGames } from '@/lib/game';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { GameCard } from '@/components/game/GameCard';

export default async function CustomerGamesPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect(ROUTES.AUTH_CUSTOMER_LOGIN);

  const visit = await getActiveVisit(customer.id);

  if (!visit) {
    return (
      <div className="space-y-6">
        <PageHeader title="Games" description="Check in to a restaurant to unlock games" />
        <EmptyState
          title="No active check-in"
          description="Scan a restaurant QR code or tap an NFC tag to start your session, then come back here to play."
          icon={<span className="text-5xl">🎮</span>}
        />
      </div>
    );
  }

  const availableGames = await getAvailableGames(visit.branchId);

  const featured = availableGames.filter((g) => g.isFeatured);
  const regular = availableGames.filter((g) => !g.isFeatured);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Games"
        description={`Playing at ${visit.branch.restaurant.name} — ${visit.branch.name}`}
      />

      {availableGames.length === 0 ? (
        <EmptyState
          title="No games available"
          description="This restaurant hasn't enabled any games yet."
          icon={<span className="text-5xl">🎮</span>}
        />
      ) : (
        <>
          {featured.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span>⭐</span> Featured Games
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((rg) => (
                  <GameCard key={rg.id} restaurantGame={rg} />
                ))}
              </div>
            </div>
          )}

          {regular.length > 0 && (
            <div>
              {featured.length > 0 && (
                <h2 className="mb-3 text-sm font-semibold text-gray-700">All Games</h2>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {regular.map((rg) => (
                  <GameCard key={rg.id} restaurantGame={rg} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
