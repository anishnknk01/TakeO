'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

const navItems = [
  {
    label: 'Overview',
    href: ROUTES.DASHBOARD_RESTAURANT_OVERVIEW,
    icon: '▦',
  },
  {
    label: 'Restaurants',
    href: ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS,
    icon: '🏪',
  },
  {
    label: 'Branches',
    href: ROUTES.DASHBOARD_RESTAURANT_BRANCHES,
    icon: '📍',
  },
  {
    label: 'Check-in',
    href: ROUTES.DASHBOARD_RESTAURANT_CHECKIN,
    icon: '✅',
  },
  {
    label: 'Games',
    href: ROUTES.DASHBOARD_RESTAURANT_GAMES,
    icon: '🎮',
  },
  {
    label: 'Leaderboard',
    href: ROUTES.DASHBOARD_RESTAURANT_LEADERBOARD,
    icon: '🏆',
  },
  {
    label: 'Rewards',
    href: ROUTES.DASHBOARD_RESTAURANT_REWARDS,
    icon: '🎁',
  },
  {
    label: 'Redeem',
    href: ROUTES.DASHBOARD_RESTAURANT_REDEEM,
    icon: '🎟️',
  },
  {
    label: 'Analytics',
    href: ROUTES.DASHBOARD_RESTAURANT_ANALYTICS,
    icon: '📊',
  },
  {
    label: 'Staff',
    href: ROUTES.DASHBOARD_RESTAURANT_STAFF,
    icon: '👤',
  },
  {
    label: 'Customers',
    href: ROUTES.DASHBOARD_RESTAURANT_CUSTOMERS,
    icon: '👥',
  },
  {
    label: 'Settings',
    href: ROUTES.DASHBOARD_RESTAURANT_SETTINGS,
    icon: '⚙️',
  },
];

export function RestaurantSidebar({ groupName }: { groupName?: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo / group name */}
      <div className="border-b border-gray-100 px-4 py-5">
        <span className="block text-sm font-bold text-brand-700">PlayBite</span>
        {groupName && (
          <span className="mt-0.5 block truncate text-xs text-gray-500">{groupName}</span>
        )}
      </div>

      <nav className="flex-1 px-2 py-4" aria-label="Restaurant navigation">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === ROUTES.DASHBOARD_RESTAURANT_OVERVIEW
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
