/**
 * Customer Leaderboard Page - Mobile-First Design
 */
'use client';

import { useState } from 'react';

export default function CustomerLeaderboardPage() {
  const [activeTab, setActiveTab] = useState('daily');

  const currentUser = {
    id: 'current',
    name: 'Aaryan',
    points: 2430,
    avatar: 'A',
    rank: 12
  };

  const leaderboardData = {
    daily: [
      { id: 1, name: 'Priya S.', points: 3850, avatar: 'P', rank: 1 },
      { id: 2, name: 'Rahul K.', points: 3420, avatar: 'R', rank: 2 },
      { id: 3, name: 'Sneha M.', points: 3180, avatar: 'S', rank: 3 },
      { id: 4, name: 'Arjun P.', points: 2950, avatar: 'A', rank: 4 },
      { id: 5, name: 'Kavya R.', points: 2800, avatar: 'K', rank: 5 },
      { id: 6, name: 'Rohan D.', points: 2650, avatar: 'R', rank: 6 },
      { id: 7, name: 'Ananya T.', points: 2500, avatar: 'A', rank: 7 },
      { id: 8, name: 'Vikram N.', points: 2480, avatar: 'V', rank: 8 },
      { id: 9, name: 'Meera J.', points: 2460, avatar: 'M', rank: 9 },
      { id: 10, name: 'Karthik L.', points: 2445, avatar: 'K', rank: 10 },
    ],
    weekly: [
      { id: 1, name: 'Sneha M.', points: 18500, avatar: 'S', rank: 1 },
      { id: 2, name: 'Priya S.', points: 17800, avatar: 'P', rank: 2 },
      { id: 3, name: 'Rahul K.', points: 16900, avatar: 'R', rank: 3 },
      { id: 4, name: 'Arjun P.', points: 15200, avatar: 'A', rank: 4 },
      { id: 5, name: 'Kavya R.', points: 14800, avatar: 'K', rank: 5 },
    ],
    monthly: [
      { id: 1, name: 'Priya S.', points: 68500, avatar: 'P', rank: 1 },
      { id: 2, name: 'Sneha M.', points: 65200, avatar: 'S', rank: 2 },
      { id: 3, name: 'Rahul K.', points: 58900, avatar: 'R', rank: 3 },
      { id: 4, name: 'Arjun P.', points: 52100, avatar: 'A', rank: 4 },
      { id: 5, name: 'Kavya R.', points: 48700, avatar: 'K', rank: 5 },
    ]
  };

  const tabs = [
    { id: 'daily', name: 'Today', icon: '📅' },
    { id: 'weekly', name: 'This Week', icon: '📊' },
    { id: 'monthly', name: 'This Month', icon: '🏆' }
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-400 to-gray-600';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const currentData = leaderboardData[activeTab as keyof typeof leaderboardData];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
          <span className="text-2xl">🏆</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Leaderboard</h1>
        <p className="text-gray-500">Compete with other players!</p>
      </div>

      {/* Current User Rank */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
              <span className="text-xl font-bold">{currentUser.avatar}</span>
            </div>
            <div>
              <p className="font-bold text-lg">Your Rank</p>
              <p className="text-green-100">#{currentUser.rank} • {currentUser.points.toLocaleString()} points</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">#{currentUser.rank}</p>
            <p className="text-green-100 text-sm">Keep climbing!</p>
          </div>
        </div>
      </div>

      {/* Time Period Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">🏆 Top Players</h2>
        <div className="flex items-end justify-center gap-4 mb-6">
          {/* 2nd Place */}
          {currentData[1] && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                <span className="text-white font-bold">{currentData[1].avatar}</span>
              </div>
              <div className="bg-gray-100 rounded-2xl px-3 py-6 min-h-[80px] flex flex-col justify-end">
                <p className="font-bold text-sm text-gray-800">{currentData[1].name}</p>
                <p className="text-xs text-gray-500">{currentData[1].points.toLocaleString()}</p>
                <div className="text-lg">🥈</div>
              </div>
            </div>
          )}
          
          {/* 1st Place */}
          {currentData[0] && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                <span className="text-white font-bold text-lg">{currentData[0].avatar}</span>
              </div>
              <div className="bg-yellow-50 rounded-2xl px-3 py-8 min-h-[100px] flex flex-col justify-end border-2 border-yellow-200">
                <p className="font-bold text-gray-800">{currentData[0].name}</p>
                <p className="text-sm text-gray-600">{currentData[0].points.toLocaleString()}</p>
                <div className="text-2xl">👑</div>
              </div>
            </div>
          )}
          
          {/* 3rd Place */}
          {currentData[2] && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                <span className="text-white font-bold">{currentData[2].avatar}</span>
              </div>
              <div className="bg-gray-100 rounded-2xl px-3 py-4 min-h-[60px] flex flex-col justify-end">
                <p className="font-bold text-sm text-gray-800">{currentData[2].name}</p>
                <p className="text-xs text-gray-500">{currentData[2].points.toLocaleString()}</p>
                <div className="text-lg">🥉</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Full Rankings</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {currentData.map((player, index) => (
            <div
              key={player.id}
              className={`p-4 flex items-center gap-4 ${
                player.name.includes('Aaryan') ? 'bg-green-50' : 'hover:bg-gray-50'
              } transition-colors duration-200`}
            >
              {/* Rank */}
              <div className="w-8 text-center">
                <span className="font-bold text-lg">
                  {getRankIcon(player.rank)}
                </span>
              </div>
              
              {/* Avatar */}
              <div className={`w-12 h-12 bg-gradient-to-br ${getRankColor(player.rank)} rounded-2xl flex items-center justify-center shadow-md`}>
                <span className="text-white font-bold">{player.avatar}</span>
              </div>
              
              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{player.name}</p>
                <p className="text-sm text-gray-500">{player.points.toLocaleString()} points</p>
              </div>
              
              {/* Rank Number */}
              <div className="text-right">
                <p className="font-bold text-lg text-gray-600">#{player.rank}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Spacing for Navigation */}
      <div className="h-4"></div>
    </div>
  );
}