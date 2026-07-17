/**
 * Restaurant Admin Dashboard - Enhanced Management Portal
 */
'use client';

import { useState } from 'react';
import PremiumSidebar from '@/components/navigation/PremiumSidebar';
import PremiumButton from '@/components/ui/PremiumButton';

export default function RestaurantAdminPage() {
  const [stats] = useState({
    totalGames: 12,
    activeGames: 8,
    totalRewards: 15,
    activeRewards: 12,
    totalCustomers: 1247,
    activeVisits: 23,
    monthlyRevenue: '₹45,600',
    rewardsClaimed: 89
  });

  const quickActions = [
    { 
      id: 'add-game', 
      title: 'Add New Game', 
      description: 'Create or import games for your restaurant',
      icon: '🎮', 
      color: 'from-blue-500 to-purple-500',
      href: '/restaurant-admin/games/new'
    },
    { 
      id: 'add-reward', 
      title: 'Create Reward', 
      description: 'Design new rewards and offers',
      icon: '🎁', 
      color: 'from-green-500 to-emerald-500',
      href: '/restaurant-admin/rewards/new'
    },
    { 
      id: 'view-analytics', 
      title: 'View Analytics', 
      description: 'Check customer engagement and revenue',
      icon: '📊', 
      color: 'from-yellow-500 to-orange-500',
      href: '/restaurant-admin/analytics'
    },
    { 
      id: 'manage-customers', 
      title: 'Customer Management', 
      description: 'View and manage customer accounts',
      icon: '👥', 
      color: 'from-pink-500 to-red-500',
      href: '/restaurant-admin/customers'
    }
  ];

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Premium Black Sidebar - Updated for Restaurant Admin */}
      <div className="w-64 flex flex-col border-r" style={{ 
        backgroundColor: '#1C1C1E', 
        borderColor: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Logo */}
        <div className="p-6" style={{ borderBottomColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" 
                 style={{ 
                   background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                   boxShadow: '0 8px 32px rgba(52,199,89,0.25)'
                 }}>
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <span className="text-xl font-bold block" style={{ color: '#FFFFFF', fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif' }}>
                PlayBite
              </span>
              <span className="text-xs" style={{ color: '#A1A1AA' }}>Restaurant Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {[
              { id: 'dashboard', icon: 'BarChart3', label: 'Dashboard', href: '/restaurant-admin' },
              { id: 'games', icon: 'Gamepad2', label: 'Games Management', href: '/restaurant-admin/games' },
              { id: 'rewards', icon: 'Gift', label: 'Rewards & Offers', href: '/restaurant-admin/rewards' },
              { id: 'customers', icon: 'Users', label: 'Customer Management', href: '/restaurant-admin/customers' },
              { id: 'analytics', icon: 'TrendingUp', label: 'Analytics & Reports', href: '/restaurant-admin/analytics' },
              { id: 'settings', icon: 'Settings', label: 'Restaurant Settings', href: '/restaurant-admin/settings' }
            ].map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ease-out group hover:scale-[1.02] hover:shadow-lg"
                style={{
                  backgroundColor: item.id === 'dashboard' 
                    ? 'rgba(52,199,89,0.15)' 
                    : 'transparent',
                  color: item.id === 'dashboard' ? '#34C759' : '#A1A1AA',
                  border: item.id === 'dashboard' 
                    ? '1px solid rgba(52,199,89,0.3)' 
                    : '1px solid transparent',
                  boxShadow: item.id === 'dashboard' 
                    ? '0 4px 20px rgba(52,199,89,0.15)' 
                    : 'none',
                  fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                  fontWeight: item.id === 'dashboard' ? '600' : '500'
                }}
              >
                <span className="transition-transform duration-300 group-hover:scale-110">
                  {item.id === 'dashboard' && '📊'}
                  {item.id === 'games' && '🎮'}
                  {item.id === 'rewards' && '🎁'}
                  {item.id === 'customers' && '👥'}
                  {item.id === 'analytics' && '📈'}
                  {item.id === 'settings' && '⚙️'}
                </span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Premium Header */}
        <div className="border-b px-8 py-6" style={{ 
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(0,0,0,0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.05)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ 
                color: '#1D1D1F',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: '700'
              }}>
                Restaurant Dashboard
              </h1>
              <p className="mt-2 text-base" style={{ 
                color: '#6E6E73',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: '400'
              }}>
                Manage games, rewards, and customer engagement
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm" style={{ 
                  color: '#6E6E73',
                  fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                  fontWeight: '400'
                }}>
                  Cafe Mocha - Koramangala
                </p>
                <p className="font-medium" style={{ 
                  color: '#1D1D1F',
                  fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                  fontWeight: '500'
                }}>
                  Welcome back!
                </p>
              </div>
              
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300 hover:scale-105" style={{
                background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                boxShadow: '0 8px 32px rgba(52,199,89,0.15)',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: '600'
              }}>
                R
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: '#F5F5F7' }}>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.02]" style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#6E6E73' }}>Active Games</p>
                  <p className="text-3xl font-bold" style={{ color: '#1D1D1F' }}>{stats.activeGames}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                  boxShadow: '0 8px 32px rgba(0,122,255,0.25)'
                }}>
                  <span className="text-2xl">🎮</span>
                </div>
              </div>
              <p className="text-sm font-medium" style={{ color: '#34C759' }}>
                {stats.totalGames} total games
              </p>
            </div>

            <div className="rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.02]" style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#6E6E73' }}>Active Rewards</p>
                  <p className="text-3xl font-bold" style={{ color: '#1D1D1F' }}>{stats.activeRewards}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                  boxShadow: '0 8px 32px rgba(52,199,89,0.25)'
                }}>
                  <span className="text-2xl">🎁</span>
                </div>
              </div>
              <p className="text-sm font-medium" style={{ color: '#34C759' }}>
                {stats.rewardsClaimed} claimed this month
              </p>
            </div>

            <div className="rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.02]" style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#6E6E73' }}>Total Customers</p>
                  <p className="text-3xl font-bold" style={{ color: '#1D1D1F' }}>{stats.totalCustomers.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, #AF52DE 0%, #FF2D92 100%)',
                  boxShadow: '0 8px 32px rgba(175,82,222,0.25)'
                }}>
                  <span className="text-2xl">👥</span>
                </div>
              </div>
              <p className="text-sm font-medium" style={{ color: '#34C759' }}>
                {stats.activeVisits} currently visiting
              </p>
            </div>

            <div className="rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.02]" style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#6E6E73' }}>Monthly Revenue</p>
                  <p className="text-3xl font-bold" style={{ color: '#1D1D1F' }}>{stats.monthlyRevenue}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, #FF9500 0%, #FFCC02 100%)',
                  boxShadow: '0 8px 32px rgba(255,149,0,0.25)'
                }}>
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              <p className="text-sm font-medium" style={{ color: '#34C759' }}>
                ↑ 23.5% from last month
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6" style={{ 
              color: '#1D1D1F',
              fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif'
            }}>
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => (
                <a
                  key={action.id}
                  href={action.href}
                  className="group block"
                >
                  <div className="rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg" style={{ 
                    backgroundColor: '#FFFFFF',
                    borderColor: 'rgba(0,0,0,0.08)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                  }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-2xl">{action.icon}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 group-hover:scale-[1.01] transition-transform duration-300" style={{ 
                      color: '#1D1D1F',
                      fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif'
                    }}>
                      {action.title}
                    </h3>
                    
                    <p className="text-sm leading-relaxed" style={{ 
                      color: '#6E6E73',
                      fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif'
                    }}>
                      {action.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Management Overview */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="rounded-3xl p-6 border" style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Games Management</h3>
                <PremiumButton href="/restaurant-admin/games" size="sm" variant="secondary">
                  Manage All
                </PremiumButton>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Memory Match', status: 'Active', plays: '1,324' },
                  { name: 'Spin Wheel', status: 'Active', plays: '987' },
                  { name: 'Quick Tap', status: 'Inactive', plays: '654' },
                  { name: 'Food Trivia', status: 'Active', plays: '432' }
                ].map((game, index) => (
                  <div key={game.name} className="flex items-center justify-between p-3 rounded-2xl" style={{ backgroundColor: '#F5F5F7' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white">🎮</span>
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#1D1D1F' }}>{game.name}</p>
                        <p className="text-sm" style={{ color: '#6E6E73' }}>{game.plays} plays</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      game.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {game.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl p-6 border" style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Rewards & Offers</h3>
                <PremiumButton href="/restaurant-admin/rewards" size="sm" variant="secondary">
                  Manage All
                </PremiumButton>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Free Appetizer', type: 'Food Reward', claimed: '45' },
                  { name: '50% off Beverages', type: 'Discount', claimed: '23' },
                  { name: 'Free Dessert', type: 'Food Reward', claimed: '18' },
                  { name: 'VIP Seating', type: 'Service', claimed: '8' }
                ].map((reward) => (
                  <div key={reward.name} className="flex items-center justify-between p-3 rounded-2xl" style={{ backgroundColor: '#F5F5F7' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                        <span className="text-white">🎁</span>
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#1D1D1F' }}>{reward.name}</p>
                        <p className="text-sm" style={{ color: '#6E6E73' }}>{reward.claimed} claimed</p>
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: '#6E6E73' }}>{reward.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}