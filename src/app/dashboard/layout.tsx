import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

/** Shared dashboard layout — verifies session at the layout level. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionPayload();
  if (!session) redirect(ROUTES.AUTH_CUSTOMER_LOGIN);

  const isCustomer = session.role === UserRole.CUSTOMER;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-brand-600">PlayBite</span>
          {isCustomer && (
            <nav className="hidden sm:flex items-center gap-4" aria-label="Customer navigation">
              <Link href={ROUTES.DASHBOARD_CUSTOMER} className="text-sm text-gray-600 hover:text-brand-600">Home</Link>
              <Link href={ROUTES.DASHBOARD_CUSTOMER_GAMES} className="text-sm text-gray-600 hover:text-brand-600">🎮 Games</Link>
              <Link href={ROUTES.DASHBOARD_CUSTOMER_SPIN} className="text-sm text-gray-600 hover:text-brand-600">🎡 Spin</Link>
              <Link href={ROUTES.DASHBOARD_CUSTOMER_REWARDS} className="text-sm text-gray-600 hover:text-brand-600">🎁 Rewards</Link>
              <Link href={ROUTES.DASHBOARD_CUSTOMER_LEADERBOARD} className="text-sm text-gray-600 hover:text-brand-600">🏆 Board</Link>
              <Link href={ROUTES.DASHBOARD_CUSTOMER_HISTORY} className="text-sm text-gray-600 hover:text-brand-600">History</Link>
            </nav>
          )}
          <span className="text-xs text-gray-400 uppercase tracking-wider">{session.role.replace(/_/g, ' ')}</span>
        </div>
      </header>
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
}
