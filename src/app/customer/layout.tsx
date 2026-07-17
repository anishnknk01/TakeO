/**
 * Customer Portal Layout - Mobile-First Design
 */
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Home', href: '/customer' },
    { id: 'games', icon: '🎮', label: 'Games', href: '/customer/games' },
    { id: 'rewards', icon: '🎁', label: 'Rewards', href: '/customer/rewards' },
    { id: 'leaderboard', icon: '🏆', label: 'Leaderboard', href: '/customer/leaderboard' },
    { id: 'profile', icon: '👤', label: 'Profile', href: '/customer/profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                PlayBite
              </span>
            </div>
            
            {/* Points Badge */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full shadow-md">
              <span className="text-sm">⭐</span>
              <span className="font-semibold text-sm">2,430</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto pb-20">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-lg">
        <div className="max-w-md mx-auto px-2 py-2">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-b from-green-500 to-emerald-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}