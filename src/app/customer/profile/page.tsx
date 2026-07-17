/**
 * Customer Profile Page - Mobile-First Design
 */
'use client';

import { useState } from 'react';

export default function CustomerProfilePage() {
  const [user] = useState({
    name: 'Aaryan',
    phone: '+91 81297 07331',
    email: 'aaryan@example.com',
    avatar: 'A',
    points: 2430,
    level: 'Gold Member',
    joinedDate: 'March 2024',
    visitStreak: 7,
    totalVisits: 23,
    favoriteRestaurant: 'Cafe Mocha'
  });

  const stats = [
    { label: 'Total Points', value: user.points.toLocaleString(), icon: '⭐', color: 'from-yellow-400 to-orange-500' },
    { label: 'Visit Streak', value: `${user.visitStreak} days`, icon: '🔥', color: 'from-red-400 to-pink-500' },
    { label: 'Total Visits', value: user.totalVisits.toString(), icon: '🏪', color: 'from-blue-400 to-purple-500' },
    { label: 'Games Played', value: '47', icon: '🎮', color: 'from-green-400 to-teal-500' }
  ];

  const achievements = [
    { id: 1, title: 'First Visit', description: 'Completed your first restaurant visit', icon: '🎯', unlocked: true },
    { id: 2, title: 'Game Master', description: 'Played 50+ games', icon: '🎮', unlocked: false },
    { id: 3, title: 'Point Collector', description: 'Earned 5,000+ points', icon: '💎', unlocked: false },
    { id: 4, title: 'Streak Champion', description: '7-day visit streak', icon: '🔥', unlocked: true },
    { id: 5, title: 'Social Butterfly', description: 'Visited 10+ restaurants', icon: '🦋', unlocked: false },
    { id: 6, title: 'Reward Hunter', description: 'Redeemed 20+ rewards', icon: '🏆', unlocked: false }
  ];

  const recentActivity = [
    { id: 1, action: 'Checked in at Cafe Mocha', time: '2 hours ago', icon: '📍' },
    { id: 2, action: 'Played Memory Match', time: '3 hours ago', icon: '🧩' },
    { id: 3, action: 'Redeemed Free Coffee', time: '1 day ago', icon: '☕' },
    { id: 4, action: 'Reached Gold Level', time: '3 days ago', icon: '🏅' }
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Profile Header */}
      <div className="text-center py-4">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl">
          <span className="text-3xl font-bold text-white">{user.avatar}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h1>
        <p className="text-green-600 font-semibold mb-1">{user.level}</p>
        <p className="text-gray-500 text-sm">Member since {user.joinedDate}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mb-3`}>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>👤</span> Personal Information
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span>📱</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-semibold text-gray-800">{user.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span>📧</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold text-gray-800">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <span>🏪</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Favorite Restaurant</p>
              <p className="font-semibold text-gray-800">{user.favoriteRestaurant}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🏆</span> Achievements
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
                achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <span className={achievement.unlocked ? 'text-lg' : 'text-lg grayscale opacity-50'}>
                  {achievement.icon}
                </span>
              </div>
              <h3 className={`font-semibold text-sm mb-1 ${
                achievement.unlocked ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {achievement.title}
              </h3>
              <p className={`text-xs ${
                achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {achievement.description}
              </p>
              {achievement.unlocked && (
                <div className="mt-2">
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    Unlocked ✓
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📊</span> Recent Activity
        </h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span>{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>⚙️</span> Settings
        </h2>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
            <span className="font-medium text-gray-800">Notifications</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
            <span className="font-medium text-gray-800">Privacy</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
            <span className="font-medium text-gray-800">Help & Support</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors duration-200">
            <span className="font-medium text-red-600">Sign Out</span>
            <span className="text-red-400">→</span>
          </button>
        </div>
      </div>

      {/* Bottom Spacing for Navigation */}
      <div className="h-4"></div>
    </div>
  );
}