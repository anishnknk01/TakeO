'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

const navItems = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD_ADMIN, icon: '▦' },
  { label: 'Restaurants', href: ROUTES.DASHBOARD_ADMIN_RESTAURANTS, icon: '🏪' },
  { label: 'Groups', href: ROUTES.DASHBOARD_ADMIN_GROUPS, icon: '🔗' },
  { label: 'Games', href: ROUTES.DASHBOARD_ADMIN_GAMES, icon: '🎮' },
  { label: 'Leaderboard', href: ROUTES.DASHBOARD_ADMIN_LEADERBOARD, icon: '🏆' },
  { label: 'Analytics', href: ROUTES.DASHBOARD_ADMIN_ANALYTICS, icon: '📊' },
  { label: 'Users', href: ROUTES.DASHBOARD_ADMIN_USERS, icon: '👥' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-5">
        <span className="block text-sm font-bold text-brand-700">PlayBite Admin</span>
      </div>
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === ROUTES.DASHBOARD_ADMIN
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span aria-hidden="true" className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
