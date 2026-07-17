/**
 * PlayBite Dashboard - Premium Design with Black Sidebar
 */
'use client';

import PremiumSidebar from '@/components/navigation/PremiumSidebar';
import PremiumButton from '@/components/ui/PremiumButton';
import Link from 'next/link';

export default function DemoDashboardPage() {
  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Premium Black Sidebar */}
      <PremiumSidebar currentPage="dashboard" />

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
                Dashboard
              </h1>
              <p className="mt-2 text-base" style={{ 
                color: '#6E6E73',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: '400'
              }}>
                May 19 - May 19
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

        {/* Main Dashboard Content */}
        <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: '#F5F5F7' }}>
          {/* Welcome Section */}
          <div className="rounded-3xl p-8 mb-8 border text-center" style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: 'rgba(0,0,0,0.08)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
          }}>
            <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg" style={{
              background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 3V21H21"/>
                <path d="M9 9L12.5 15.5L16 12L22 18"/>
                <path d="M9 9H13V13"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ 
              color: '#1D1D1F',
              fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif'
            }}>
              Welcome to PlayBite Restaurant Management
            </h2>
            <p className="text-lg mb-6" style={{ 
              color: '#6E6E73',
              fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif'
            }}>
              Create games and rewards to engage your customers
            </p>
            <div className="flex gap-4 justify-center">
              <PremiumButton href="/games" size="lg">
                Create Your First Game
              </PremiumButton>
              <PremiumButton href="/rewards" size="lg" variant="secondary">
                Set Up Rewards
              </PremiumButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}