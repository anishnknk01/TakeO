import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { requireRole } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { RestaurantSidebar } from '@/components/navigation/RestaurantSidebar';

export default async function RestaurantDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(UserRole.RESTAURANT_OWNER, UserRole.RESTAURANT_STAFF).catch(() => null);
  if (!session) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const group = session.restaurantGroupId
    ? await prisma.restaurantGroup.findUnique({
        where: { id: session.restaurantGroupId },
        select: { name: true },
      })
    : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RestaurantSidebar groupName={group?.name} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">{session.role.replace('_', ' ')}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
