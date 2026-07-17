/**
 * Customer Games Page - Mobile-First Design
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CustomerGamesPage() {
  const [activeTab, setActiveTab] = useState('all');

  const games = [
    {
      id: 'memory-match',
      title: 'Memory Match',
      description: 'Match pairs of cards to win points',
      difficulty: 'Easy',
      points: '50-150 pts',
      time: '2 mins',
      icon: '🧩',
      gradient: 'from-blue-400 to-blue-600',
      category: 'puzzle'
    },
    {
      id: 'spin-wheel',
      title: 'Lucky Wheel',
      description: 'Spin the wheel for instant rewards',
      difficulty: 'Easy',
      points: '10-500 pts',
      time: '30 secs',
      icon: '🎡',
      gradient: 'from-pink-400 to-pink-600',
      category: 'luck'
    },
    {
      id: 'quick-tap',
      title: 'Quick Tap',
      description: 'Tap as fast as you can before time runs out',
      difficulty: 'Medium',
      points: '100-300 pts',
      time: '1 min',
      icon: '⚡',
      gradient: 'from-yellow-400 to-orange-500',
      category: 'action'
    },
    {
      id: 'trivia',
      title: 'Food Trivia',
      description: 'Test your knowledge about food and restaurants',
      difficulty: 'Medium',
      points: '75-200 pts',
      time: '3 mins',
      icon: '🤔',
      gradient: 'from-purple-400 to-purple-600',
      category: 'trivia'
    },
    {
      id: 'word-game',
      title: 'Word Search',
      description: 'Find hidden words in the puzzle',
      difficulty: 'Hard',
      points: '150-400 pts',
      time: '5 mins',
      icon: '📝',
      gradient: 'from-green-400 to-green-600',
      category: 'puzzle'
    },
    {
      id: 'color-match',
      title: 'Color Rush',
      description: 'Match colors in this fast-paced game',
      difficulty: 'Hard',
      points: '200-500 pts',
      time: '2 mins',
      icon: '🎨',
      gradient: 'from-red-400 to-red-600',
      category: 'action'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'puzzle', name: 'Puzzle', icon: '🧩' },
    { id: 'action', name: 'Action', icon: '⚡' },
    { id: 'luck', name: 'Lucky', icon: '🍀' },
    { id: 'trivia', name: 'Trivia', icon: '🤔' }
  ];

  const filteredGames = activeTab === 'all' ? games : games.filter(game => game.category === activeTab);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">🎮 Play & Earn</h1>
        <p className="text-gray-500">Win points by playing amazing games!</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${
              activeTab === category.id
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Featured Game (First game in list) */}
      {filteredGames.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 px-2">🌟 Featured Game</h2>
          <div className={`bg-gradient-to-br ${filteredGames[0].gradient} rounded-3xl p-6 text-white shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
                <span className="text-3xl">{filteredGames[0].icon}</span>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">Earn up to</p>
                <p className="font-bold text-lg">{filteredGames[0].points}</p>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{filteredGames[0].title}</h3>
            <p className="text-white/90 mb-4">{filteredGames[0].description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <span>⏱️</span> {filteredGames[0].time}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(filteredGames[0].difficulty)} bg-white/20 text-white`}>
                  {filteredGames[0].difficulty}
                </span>
              </div>
              <Link 
                href={`/customer/games/${filteredGames[0].id}`}
                className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-2xl font-medium hover:bg-white/30 transition-all duration-300"
              >
                Play Now →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* All Games Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">
          {activeTab === 'all' ? 'All Games' : `${categories.find(c => c.id === activeTab)?.name} Games`}
        </h2>
        <div className="grid gap-4">
          {filteredGames.map((game, index) => (
            <Link
              key={game.id}
              href={`/customer/games/${game.id}`}
              className="group"
            >
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${game.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <span className="text-2xl">{game.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 mb-1">{game.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{game.description}</p>
                    
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`px-2 py-1 rounded-full ${getDifficultyColor(game.difficulty)}`}>
                        {game.difficulty}
                      </span>
                      <span className="text-gray-500">⏱️ {game.time}</span>
                      <span className="text-green-600 font-semibold">{game.points}</span>
                    </div>
                  </div>
                  
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors duration-300">
                    <span className="text-gray-400 group-hover:text-green-600 transition-colors duration-300">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Spacing for Navigation */}
      <div className="h-4"></div>
    </div>
  );
}