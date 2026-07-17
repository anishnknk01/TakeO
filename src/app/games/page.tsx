/**
 * PlayBite Games Management - Restaurant Admin Interface
 * Complete CRUD operations for game management
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import PremiumSidebar from '@/components/navigation/PremiumSidebar';
import PremiumButton from '@/components/ui/PremiumButton';
import Link from 'next/link';

// Game Components
import { MemoryMatchGame } from '@/components/games/MemoryMatchGame';
import { SpinWheelGame } from '@/components/games/SpinWheelGame';
import { QuickTapGame } from '@/components/games/QuickTapGame';
import { TriviaGame } from '@/components/games/TriviaGame';

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<{score: number; points: number} | null>(null);
  const [activeTab, setActiveTab] = useState('my-games');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Empty games array - users will create their own games
  const games: any[] = [];

  const handleGameComplete = useCallback((score: number, pointsEarned: number) => {
    setGameResult({ score, points: pointsEarned });
  }, []);

  const startNewGame = (gameId: string) => {
    setSelectedGame(gameId);
    setGameResult(null);
  };

  const backToGames = () => {
    setSelectedGame(null);
    setGameResult(null);
  };

  const currentGame = games.find(g => g.id === selectedGame);

  const renderIcon = (iconName: string, size: number = 24) => {
    const iconProps = {
      width: size,
      height: size,
      stroke: 'currentColor',
      strokeWidth: 2,
      fill: 'none',
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const
    };

    switch (iconName) {
      case 'zap':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8Z"/>
          </svg>
        );
      case 'scissors':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <circle cx="6" cy="6" r="3"/>
            <path d="m21.5 21.5-4.8-4.8"/>
            <circle cx="6" cy="18" r="3"/>
            <path d="m20.5 9.5-1-1"/>
            <path d="M12 7l6 6"/>
            <path d="M6 7v11"/>
          </svg>
        );
      case 'puzzle':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M19.439 7.85c-.049.322-.059.648-.026.975.022.23-.08.44-.26.57l-.78.52c-.33.22-.44.63-.26.99.18.36.01.8-.37.99l-1.19.69c-.32.18-.67.26-1.02.26-.35 0-.7-.08-1.02-.26l-1.19-.69c-.38-.19-.55-.63-.37-.99.18-.36.07-.77-.26-.99l-.78-.52c-.18-.13-.28-.34-.26-.57.033-.327.023-.653-.026-.975-.037-.248.034-.499.194-.689l.78-.92c.16-.19.21-.46.13-.71-.08-.25.04-.52.29-.67l1.19-.69c.64-.37 1.4-.37 2.04 0l1.19.69c.25.15.37.42.29.67-.08.25-.03.52.13.71l.78.92c.16.19.231.441.194.689Z"/>
            <path d="M12 2v6.5"/>
            <path d="m21 12-6.5 0"/>
            <path d="M12 22v-6.5"/>
            <path d="m3 12 6.5 0"/>
          </svg>
        );
      case 'gamepad':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <line x1="6" y1="11" x2="10" y2="11"/>
            <line x1="8" y1="9" x2="8" y2="13"/>
            <line x1="15" y1="12" x2="15.01" y2="12"/>
            <line x1="18" y1="10" x2="18.01" y2="10"/>
            <rect width="20" height="12" x="2" y="6" rx="2"/>
          </svg>
        );
      case 'plus':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Premium Black Sidebar */}
      <PremiumSidebar currentPage="games" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedGame ? (
          <>
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
                    Games Management
                  </h1>
                  <p className="mt-2 text-base" style={{ 
                    color: '#6E6E73',
                    fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                    fontWeight: '400'
                  }}>
                    Create, manage, and analyze your restaurant games
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

            {/* Management Content */}
            <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: '#F5F5F7' }}>
              {/* Management Tabs */}
              <div className="flex gap-2 mb-8">
                {[
                  { id: 'my-games', name: 'My Games', count: games.length },
                  { id: 'templates', name: 'Templates', count: 4 },
                  { id: 'analytics', name: 'Analytics', count: null }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
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
                    <h2 className="text-xl font-bold" style={{ color: '#1D1D1F' }}>
                      Manage Your Games ({games.length})
                    </h2>
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                        boxShadow: '0 8px 32px rgba(52,199,89,0.25)'
                      }}
                    >
                      {renderIcon('gamepad', 20)} Create New Game
                    </button>
                  </div>

                  {games.length === 0 ? (
                    <div className="rounded-3xl p-8 border text-center" style={{ 
                      backgroundColor: '#FFFFFF',
                      borderColor: 'rgba(0,0,0,0.08)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                    }}>
                      <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg" style={{
                        background: 'linear-gradient(135deg, #AF52DE 0%, #FF2D92 100%)'
                      }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <line x1="6" y1="11" x2="10" y2="11"/>
                          <line x1="8" y1="9" x2="8" y2="13"/>
                          <line x1="15" y1="12" x2="15.01" y2="12"/>
                          <line x1="18" y1="10" x2="18.01" y2="10"/>
                          <rect width="20" height="12" x="2" y="6" rx="2"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-4" style={{ color: '#1D1D1F' }}>
                        No Games Yet
                      </h3>
                      <p className="text-lg mb-6" style={{ color: '#6E6E73' }}>
                        Create your first game to engage customers
                      </p>
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                          boxShadow: '0 8px 32px rgba(52,199,89,0.25)'
                        }}
                      >
                        Create Your First Game
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {games.map((game) => (
                        <div key={game.id} 
                             className="group rounded-3xl p-6 transition-all duration-300 ease-out hover:scale-[1.01] border"
                             style={{ 
                               backgroundColor: '#FFFFFF',
                               borderColor: 'rgba(0,0,0,0.08)',
                               boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                             }}>
                          <div className="flex gap-6">
                            <div className="flex-shrink-0">
                              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${game.gradient}`}>
                                <span className="text-white">{renderIcon(game.image, 36)}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-2" style={{ color: '#1D1D1F' }}>
                                {game.name}
                              </h3>
                              <p className="mb-3" style={{ color: '#6E6E73' }}>
                                {game.description}
                              </p>
                              <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  game.status === 'Active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                                }`}>
                                  {game.status}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                                  {game.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold" style={{ color: '#1D1D1F' }}>
                    Game Templates
                  </h2>
                  <p className="text-gray-600 mb-6">Choose from pre-built game templates to get started quickly</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map((game) => (
                      <div 
                        key={game.id}
                        className="rounded-3xl border overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                        style={{ 
                          backgroundColor: '#FFFFFF',
                          borderColor: 'rgba(0,0,0,0.08)',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                        }}
                        onClick={() => setShowCreateModal(true)}
                      >
                        <div className={`h-32 bg-gradient-to-br ${game.gradient} flex items-center justify-center relative overflow-hidden`}>
                          <span className="text-white group-hover:scale-110 transition-transform duration-300">
                            {renderIcon(game.image, 48)}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold mb-1" style={{ color: '#1D1D1F' }}>
                            {game.name} Template
                          </h3>
                          <p className="text-sm mb-3" style={{ color: '#6E6E73' }}>Create a {game.category.toLowerCase()} game</p>
                          <PremiumButton size="sm" className="w-full">Use Template</PremiumButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold" style={{ color: '#1D1D1F' }}>
                    Games Analytics
                  </h2>
                  <div className="grid gap-6">
                    <div className="rounded-3xl p-6 border" style={{ 
                      backgroundColor: '#FFFFFF',
                      borderColor: 'rgba(0,0,0,0.08)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                    }}>
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#1D1D1F' }}>Performance Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{games.length}</div>
                          <div className="text-sm text-gray-600">Active Games</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{games.reduce((sum, game) => sum + game.plays, 0)}</div>
                          <div className="text-sm text-gray-600">Total Plays</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{games.reduce((sum, game) => sum + game.earnings, 0)}</div>
                          <div className="text-sm text-gray-600">Total Earnings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{Math.round(games.reduce((sum, game) => sum + game.avgScore, 0) / games.length)}</div>
                          <div className="text-sm text-gray-600">Avg Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : gameResult ? (
          <>
            {/* Game Complete Screen */}
            <div className="border-b px-8 py-6" style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.08)'
            }}>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold" style={{ color: '#1D1D1F' }}>Game Complete! 🎉</h1>
                <PremiumButton onClick={backToGames}>Back to Games</PremiumButton>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#F5F5F7' }}>
              <div className="max-w-2xl w-full text-center">
                <div className="rounded-3xl p-12 border" style={{ 
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(0,0,0,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                  <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-8 shadow-lg" style={{
                    background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)'
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                      <path d="M6 9H4.5C3.11929 9 2 7.88071 2 6.5C2 5.11929 3.11929 4 4.5 4H6"/>
                      <path d="M18 9H19.5C20.8807 9 22 7.88071 22 6.5C22 5.11929 20.8807 4 19.5 4H18"/>
                      <path d="M8 22V18"/>
                      <path d="M16 22V18"/>
                      <path d="M8 18H16"/>
                      <path d="M6 4V13C6 15.2091 7.79086 17 10 17H14C16.2091 17 18 15.2091 18 13V4H6Z"/>
                    </svg>
                  </div>
                  <h2 className="text-4xl font-bold mb-4" style={{ color: '#1D1D1F' }}>Congratulations!</h2>
                  <p className="text-xl mb-8" style={{ color: '#6E6E73' }}>
                    You completed: <span className="font-bold" style={{ color: '#34C759' }}>{currentGame?.name}</span>
                  </p>
                  
                  <div className="rounded-2xl p-8 mb-8 border" style={{ 
                    backgroundColor: 'rgba(52,199,89,0.05)',
                    borderColor: 'rgba(52,199,89,0.2)'
                  }}>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: '#34C759' }}>Final Score</p>
                        <p className="text-4xl font-bold" style={{ color: '#34C759' }}>{gameResult.score}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: '#34C759' }}>Points Earned</p>
                        <p className="text-4xl font-bold" style={{ color: '#34C759' }}>+{gameResult.points} 💎</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <PremiumButton onClick={backToGames} size="lg">Play More Games</PremiumButton>
                    <PremiumButton href="/rewards" size="lg" variant="secondary">View Rewards</PremiumButton>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : currentGame ? (
          <>
            {/* Game Playing Screen */}
            <div className="border-b px-8 py-6" style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.08)'
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${currentGame.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <span className="text-white">{renderIcon(currentGame.image, 24)}</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#1D1D1F' }}>{currentGame.name}</h1>
                    <p style={{ color: '#6E6E73' }}>Good luck! Earn points while you play</p>
                  </div>
                </div>
                <PremiumButton onClick={backToGames} variant="secondary">← Back to Games</PremiumButton>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: '#F5F5F7' }}>
              <div className="max-w-5xl mx-auto">
                <div className="rounded-3xl p-8 border" style={{ 
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(0,0,0,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                  <currentGame.component onGameComplete={handleGameComplete} />
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Create Game Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#1D1D1F' }}>
                  Create New Game
                </h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>

              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newGame = {
                  id: Date.now().toString(),
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  category: formData.get('category') as string,
                  difficulty: formData.get('difficulty') as string,
                  points: formData.get('points') as string + ' pts',
                  status: 'Active',
                  plays: 0,
                  avgScore: 0,
                  topScore: 0,
                  earnings: 0,
                  image: 'gamepad',
                  gradient: 'from-blue-500 to-indigo-600'
                };
                console.log('Creating new game:', newGame);
                setShowCreateModal(false);
                alert('Game created successfully! (Demo mode - not saved to database)');
              }}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                      Game Name
                    </label>
                    <input 
                      name="name"
                      type="text" 
                      placeholder="e.g. Word Challenge"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                      Category
                    </label>
                    <select 
                      name="category"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Action">Action</option>
                      <option value="Puzzle">Puzzle</option>
                      <option value="Casual">Casual</option>
                      <option value="Speed">Speed</option>
                      <option value="Trivia">Trivia</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                    Description
                  </label>
                  <textarea 
                    name="description"
                    placeholder="Describe your game..."
                    rows={3}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                      Difficulty
                    </label>
                    <select 
                      name="difficulty"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                      Points per Play
                    </label>
                    <input 
                      name="points"
                      type="number" 
                      placeholder="8"
                      min="1"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 px-6 rounded-xl border border-gray-200 font-medium transition-all duration-300"
                    style={{ color: '#6E6E73' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                      boxShadow: '0 4px 16px rgba(52,199,89,0.25)'
                    }}
                  >
                    Create Game
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}