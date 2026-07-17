/**
 * Customer Portal Dashboard - Mobile-First Design
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CustomerDashboardPage() {
  const [user] = useState({
    name: 'Aaryan',
    avatar: 'A',
    points: 2430,
    level: 'Gold Member',
    visitStreak: 7
  });

  const [activeSession] = useState({
    restaurant: 'Cafe Mocha',
    branch: 'Koramangala',
    checkedInAt: '2:30 PM',
    timeRemaining: '1h 45m'
  });

  const quickActions = [
    { id: 'games', title: 'Play Games', icon: '🎮', color: 'from-blue-500 to-purple-500', href: '/customer/games' },
    { id: 'spin', title: 'Spin Wheel', icon: '🎡', color: 'from-pink-500 to-red-500', href: '/customer/games' },
    { id: 'rewards', title: 'My Rewards', icon: '🎁', color: 'from-green-500 to-emerald-500', href: '/customer/rewards' },
    { id: 'leaderboard', title: 'Leaderboard', icon: '🏆', color: 'from-yellow-500 to-orange-500', href: '/customer/leaderboard' },
  ];

  const recentActivities = [
    { id: 1, type: 'game', title: 'Memory Match completed', points: '+150', time: '10 mins ago', icon: '🧩' },
    { id: 2, type: 'spin', title: 'Wheel Spin - Free Coffee!', points: '+200', time: '25 mins ago', icon: '🎡' },
    { id: 3, type: 'checkin', title: 'Checked in at Cafe Mocha', points: '+50', time: '45 mins ago', icon: '📍' },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Welcome Section */}
      <div className="text-center py-4">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-white">{user.avatar}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Hey {user.name}! 👋</h1>
        <p className="text-gray-500 text-sm">{user.level} • {user.visitStreak} day streak 🔥</p>
      </div>

      {/* Active Session Card */}
      {activeSession && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Currently at</h3>
              <p className="text-green-100">{activeSession.restaurant} - {activeSession.branch}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-xl">📍</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Checked in at {activeSession.checkedInAt}</p>
              <p className="font-semibold">Session expires in {activeSession.timeRemaining}</p>
            </div>
            <Link 
              href="/customer/games"
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl font-medium hover:bg-white/30 transition-all duration-300"
            >
              Play Now →
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="group"
            >
              <div className={`bg-gradient-to-br ${action.color} rounded-3xl p-6 text-white shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{action.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">Your Stats</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-500 mb-1">{user.points.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total Points</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-500 mb-1">47</div>
            <div className="text-xs text-gray-500">Games Played</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-purple-500 mb-1">#12</div>
            <div className="text-xs text-gray-500">Rank Today</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                <span className="text-lg">{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
              <div className="text-green-500 font-bold text-sm">{activity.points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}