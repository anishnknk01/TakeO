/**
 * PlayBite Leaderboard - Premium Design with Black Sidebar
 */
'use client';

import PremiumSidebar from '@/components/navigation/PremiumSidebar';
import PremiumButton from '@/components/ui/PremiumButton';

export default function LeaderboardPage() {
  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Premium Black Sidebar */}
      <PremiumSidebar currentPage="leaderboard" />

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
                Leaderboard
              </h1>
              <p className="mt-2 text-base" style={{ 
                color: '#6E6E73',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: '400'
              }}>
                Customer rankings and achievements
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm" style={{ 
                  color: '#6E6E73',
                  fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                  fontWeight: '400'
                }}>
                  Hi Restaurant Owner
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
        {/* Main Leaderboard Content */}
        <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: '#F5F5F7' }}>
          <div className="rounded-3xl p-8 border text-center" style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: 'rgba(0,0,0,0.08)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
          }}>
            <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg" style={{
              background: 'linear-gradient(135deg, #FF9500 0%, #FFCC02 100%)'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path d="M6 9H4.5C3.11929 9 2 7.88071 2 6.5C2 5.11929 3.11929 4 4.5 4H6"/>
                <path d="M18 9H19.5C20.8807 9 22 7.88071 22 6.5C22 5.11929 20.8807 4 19.5 4H18"/>
                <path d="M8 22V18"/>
                <path d="M16 22V18"/>
                <path d="M8 18H16"/>
                <path d="M6 4V13C6 15.2091 7.79086 17 10 17H14C16.2091 17 18 15.2091 18 13V4H6Z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ 
              color: '#1D1D1F',
              fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif'
            }}>
              Leaderboard Coming Soon
            </h2>
            <p className="text-lg mb-6" style={{ 
              color: '#6E6E73',
              fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif'
            }}>
              Customer rankings will appear here once games are active
            </p>
            <PremiumButton href="/games" size="lg">
              Create Games
            </PremiumButton>
          </div>
        </div>
      </div>
    </div>
  );
}