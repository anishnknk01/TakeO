/**
 * Restaurant Games Management - Full CRUD Operations
 */
'use client';

import { useState } from 'react';
import PremiumButton from '@/components/ui/PremiumButton';

export default function RestaurantGamesManagementPage() {
  const [activeTab, setActiveTab] = useState('my-games');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const myGames = [
    {
      id: 1,
      name: 'Memory Match',
      description: 'Match pairs of cards to win points',
      category: 'Puzzle',
      difficulty: 'Easy',
      status: 'Active',
      plays: 1324,
      avgScore: 850,
      pointsAwarded: '50-200',
      timeLimit: '2 mins',
      customRules: 'Double points on weekends',
      image: '🧩'
    },
    {
      id: 2,
      name: 'Spin Wheel',
      description: 'Lucky wheel with instant prizes',
      category: 'Luck',
      difficulty: 'Easy',
      status: 'Active',
      plays: 987,
      avgScore: 0,
      pointsAwarded: '10-500',
      timeLimit: '30 secs',
      customRules: 'Max 3 spins per visit',
      image: '🎡'
    },
    {
      id: 3,
      name: 'Quick Tap Challenge',
      description: 'Tap as fast as you can before time runs out',
      category: 'Action',
      difficulty: 'Medium',
      status: 'Inactive',
      plays: 654,
      avgScore: 1200,
      pointsAwarded: '100-300',
      timeLimit: '1 min',
      customRules: 'Bonus points for high scores',
      image: '⚡'
    },
    {
      id: 4,
      name: 'Food Trivia',
      description: 'Test your knowledge about food and restaurants',
      category: 'Trivia',
      difficulty: 'Medium',
      status: 'Active',
      plays: 432,
      avgScore: 750,
      pointsAwarded: '75-250',
      timeLimit: '3 mins',
      customRules: 'Extra questions about our menu',
      image: '🤔'
    }
  ];

  const gameLibrary = [
    {
      id: 101,
      name: 'Word Search',
      description: 'Find hidden words in the puzzle',
      category: 'Puzzle',
      difficulty: 'Hard',
      pointsRange: '150-400',
      timeLimit: '5 mins',
      image: '📝',
      isPremium: false
    },
    {
      id: 102,
      name: 'Color Match',
      description: 'Match colors in this fast-paced game',
      category: 'Action',
      difficulty: 'Hard',
      pointsRange: '200-500',
      timeLimit: '2 mins',
      image: '🎨',
      isPremium: true
    },
    {
      id: 103,
      name: 'Number Puzzle',
      description: 'Solve mathematical puzzles',
      category: 'Math',
      difficulty: 'Medium',
      pointsRange: '100-300',
      timeLimit: '4 mins',
      image: '🔢',
      isPremium: false
    },
    {
      id: 104,
      name: 'Restaurant Rush',
      description: 'Manage orders in a busy restaurant',
      category: 'Strategy',
      difficulty: 'Hard',
      pointsRange: '250-600',
      timeLimit: '5 mins',
      image: '🍽️',
      isPremium: true
    }
  ];

  const categories = ['All', 'Puzzle', 'Action', 'Luck', 'Trivia', 'Math', 'Strategy'];
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-600';
      case 'Medium': return 'bg-yellow-100 text-yellow-600';
      case 'Hard': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Sidebar Navigation */}
      <div className="w-64 flex flex-col border-r" style={{ 
        backgroundColor: '#1C1C1E', 
        borderColor: 'rgba(255,255,255,0.08)'
      }}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" 
                 style={{ background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)' }}>
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <span className="text-xl font-bold block text-white">PlayBite</span>
              <span className="text-xs text-gray-400">Games Management</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <a href="/restaurant-admin" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white">
              <span>📊</span> <span>Dashboard</span>
            </a>
            <a href="/restaurant-admin/games" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-green-500/15 text-green-500 border border-green-500/30">
              <span>🎮</span> <span>Games Management</span>
            </a>
            <a href="/restaurant-admin/rewards" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white">
              <span>🎁</span> <span>Rewards & Offers</span>
            </a>
            <a href="/restaurant-admin/customers" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white">
              <span>👥</span> <span>Customers</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b px-8 py-6 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Games Management</h1>
              <p className="mt-2 text-gray-600">Create, customize, and manage games for your restaurant</p>
            </div>
            
            <div className="flex items-center gap-4">
              <PremiumButton 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <span>➕</span> Create Custom Game
              </PremiumButton>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { id: 'my-games', name: 'My Games', count: myGames.length },
              { id: 'game-library', name: 'Game Library', count: gameLibrary.length },
              { id: 'analytics', name: 'Game Analytics', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.name}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* My Games Tab */}
          {activeTab === 'my-games' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Your Active Games ({myGames.length})</h2>
                <div className="flex items-center gap-3">
                  <select className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>All Categories</option>
                    {categories.slice(1).map(cat => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                  <select className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-6">
                {myGames.map((game) => (
                  <div key={game.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-6">
                      {/* Game Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center text-2xl">
                        {game.image}
                      </div>

                      {/* Game Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{game.name}</h3>
                            <p className="text-gray-600 mb-3">{game.description}</p>
                            
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                                {game.difficulty}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                                {game.status}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                                {game.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <PremiumButton size="sm" variant="outline">Edit</PremiumButton>
                            <PremiumButton size="sm" variant="secondary">Settings</PremiumButton>
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                              <span>🗑️</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Total Plays</p>
                            <p className="font-semibold text-gray-800">{game.plays.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Avg Score</p>
                            <p className="font-semibold text-gray-800">{game.avgScore > 0 ? game.avgScore.toLocaleString() : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Points Range</p>
                            <p className="font-semibold text-gray-800">{game.pointsAwarded}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Time Limit</p>
                            <p className="font-semibold text-gray-800">{game.timeLimit}</p>
                          </div>
                        </div>

                        {game.customRules && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <p className="text-sm text-yellow-800">
                              <strong>Custom Rules:</strong> {game.customRules}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Library Tab */}
          {activeTab === 'game-library' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Game Library ({gameLibrary.length} games)</h2>
                <div className="flex items-center gap-3">
                  <input 
                    type="search" 
                    placeholder="Search games..."
                    className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gameLibrary.map((game) => (
                  <div key={game.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                    {game.isPremium && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                          Premium
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl flex items-center justify-center text-2xl mx-auto mb-3">
                        {game.image}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{game.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{game.description}</p>
                      
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                          {game.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                          {game.category}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <p>Points: {game.pointsRange}</p>
                        <p>Time: {game.timeLimit}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <PremiumButton size="sm" className="flex-1">
                        Add to Restaurant
                      </PremiumButton>
                      <button className="px-3 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Game Performance Analytics</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Most Popular Games</h3>
                  <div className="space-y-3">
                    {myGames.sort((a, b) => b.plays - a.plays).slice(0, 5).map((game, index) => (
                      <div key={game.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{game.image}</span>
                          <span className="font-medium text-gray-700">{game.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{game.plays} plays</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Engagement Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Daily Active Players</p>
                      <p className="text-2xl font-bold text-gray-800">247</p>
                      <p className="text-xs text-green-600">↑ 12.5% from yesterday</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg Session Duration</p>
                      <p className="text-2xl font-bold text-gray-800">8.5min</p>
                      <p className="text-xs text-green-600">↑ 5.2% from last week</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Revenue Impact</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Points Awarded</p>
                      <p className="text-2xl font-bold text-gray-800">45,620</p>
                      <p className="text-xs text-blue-600">This month</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer Retention</p>
                      <p className="text-2xl font-bold text-gray-800">78%</p>
                      <p className="text-xs text-green-600">↑ 8.3% improvement</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}