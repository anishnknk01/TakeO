/**
 * Premium Black Sidebar Navigation Component
 * Consistent navigation across all PlayBite pages
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SidebarProps {
  currentPage: string;
}

export default function PremiumSidebar({ currentPage }: SidebarProps) {
  const [activeTab, setActiveTab] = useState(currentPage);

  const sidebarItems = [
    { id: 'dashboard', icon: 'BarChart3', label: 'Dashboard', href: '/demo-dashboard' },
    { id: 'games', icon: 'Gamepad2', label: 'Games', href: '/games' },
    { id: 'rewards', icon: 'Gift', label: 'Rewards', href: '/rewards' },
    { id: 'leaderboard', icon: 'Trophy', label: 'Leaderboard', href: '/leaderboard' },
    { id: 'analytics', icon: 'TrendingUp', label: 'Analytics', href: '/analytics' },
    { id: 'settings', icon: 'Settings', label: 'Settings', href: '/settings' },
  ];

  const renderIcon = (iconName: string) => {
    const iconProps = {
      width: 20,
      height: 20,
      stroke: 'currentColor',
      strokeWidth: 1.5,
      fill: 'none'
    };

    switch (iconName) {
      case 'BarChart3':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M3 3V21H21" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 9L12.5 15.5L16 12L22 18" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 9H13V13" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Users':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8.5" cy="7" r="4"/>
            <path d="M23 21V19C23 16.7909 21.2091 15 19 15C18.0271 15 17.1399 15.2522 16.4 15.6906" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" fill="none"/>
          </svg>
        );
      case 'Gamepad2':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <line x1="6" y1="11" x2="10" y2="11" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="9" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="15" y1="12" x2="15.01" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="18" y1="10" x2="18.01" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
            <rect width="20" height="12" x="2" y="6" rx="2"/>
          </svg>
        );
      case 'Gift':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <rect x="3" y="8" width="18" height="4" rx="1"/>
            <path d="M12 8V21" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 12V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.5 8C6.11929 8 5 6.88071 5 5.5C5 4.11929 6.11929 3 7.5 3C8.88071 3 10 4.11929 10 5.5C10 6.88071 8.88071 8 7.5 8Z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.5 8C15.1193 8 14 6.88071 14 5.5C14 4.11929 15.1193 3 16.5 3C17.8807 3 19 4.11929 19 5.5C19 6.88071 17.8807 8 16.5 8Z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'RotateCcw':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.61386 21 7.50832 19.8649 6.21955 18.1222" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 16V12H7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Trophy':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M6 9H4.5C3.11929 9 2 7.88071 2 6.5C2 5.11929 3.11929 4 4.5 4H6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 9H19.5C20.8807 9 22 7.88071 22 6.5C22 5.11929 20.8807 4 19.5 4H18" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 22V18" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 22V18" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 18H16" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 4V13C6 15.2091 7.79086 17 10 17H14C16.2091 17 18 15.2091 18 13V4H6Z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'TrendingUp':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="16,7 22,7 22,13" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Settings':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5161 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742748 9.96512 4.01133 9.77251C4.27991 9.5799 4.48394 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29583 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29583 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
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
          <span className="text-xl font-bold" style={{ color: '#FFFFFF', fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif' }}>
            PlayBite
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ease-out group hover:scale-[1.02] hover:shadow-lg"
              style={{
                backgroundColor: activeTab === item.id 
                  ? 'rgba(52,199,89,0.15)' 
                  : 'transparent',
                color: activeTab === item.id ? '#34C759' : '#A1A1AA',
                border: activeTab === item.id 
                  ? '1px solid rgba(52,199,89,0.3)' 
                  : '1px solid transparent',
                boxShadow: activeTab === item.id 
                  ? '0 4px 20px rgba(52,199,89,0.15)' 
                  : 'none',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: activeTab === item.id ? '600' : '500'
              }}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {renderIcon(item.icon)}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t space-y-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link
          href="/support"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 w-full group hover:scale-[1.02]"
          style={{ 
            color: activeTab === 'support' ? '#34C759' : '#A1A1AA',
            backgroundColor: activeTab === 'support' ? 'rgba(52,199,89,0.15)' : 'transparent',
            border: activeTab === 'support' ? '1px solid rgba(52,199,89,0.3)' : '1px solid transparent',
            fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
            fontWeight: '500'
          }}
          onClick={() => setActiveTab('support')}
        >
          <span className="transition-transform duration-300 group-hover:scale-110">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span>Support</span>
        </Link>
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 w-full group hover:scale-[1.02]"
          style={{ 
            color: '#A1A1AA',
            fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
            fontWeight: '500'
          }}
        >
          <span className="transition-transform duration-300 group-hover:scale-110">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16,17 21,12 16,7" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span>Log Out</span>
        </Link>
      </div>
    </div>
  );
}