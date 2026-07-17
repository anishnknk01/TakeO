/**
 * Individual Customer Game Page
 */
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Game Components
import { MemoryMatchGame } from '@/components/games/MemoryMatchGame';
import { SpinWheelGame } from '@/components/games/SpinWheelGame';
import { QuickTapGame } from '@/components/games/QuickTapGame';
import { TriviaGame } from '@/components/games/TriviaGame';

interface GamePageProps {
  params: {
    gameId: string;
  };
}

export default function CustomerGamePage({ params }: GamePageProps) {
  const router = useRouter();
  const [gameResult, setGameResult] = useState<{score: number; points: number} | null>(null);
  const [totalPoints, setTotalPoints] = useState(1450); // User's total points

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
      category: 'puzzle',
      component: MemoryMatchGame
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
      category: 'luck',
      component: SpinWheelGame
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
      category: 'action',
      component: QuickTapGame
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
      category: 'trivia',
      component: TriviaGame
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
      category: 'puzzle',
      component: MemoryMatchGame // Use memory match as fallback
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
      category: 'action',
      component: QuickTapGame // Use quick tap as fallback
    }
  ];

  const currentGame = games.find(g => g.id === params.gameId);

  const handleGameComplete = useCallback((score: number, pointsEarned: number) => {
    setGameResult({ score, points: pointsEarned });
    setTotalPoints(prev => prev + pointsEarned);
  }, []);

  const handleBackToGames = () => {
    router.push('/customer/games');
  };

  // If game not found, redirect back
  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Game Not Found</h1>
          <p className="text-gray-600 mb-6">The game you're looking for doesn't exist.</p>
          <Link
            href="/customer/games"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-2xl font-medium hover:bg-green-600 transition-colors"
          >
            ← Back to Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {gameResult ? (
        // Game Complete Screen
        <div className="p-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-4 shadow-sm">
              <h1 className="text-xl font-bold text-gray-800">Game Complete! 🎉</h1>
              <button
                onClick={handleBackToGames}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Back to Games
              </button>
            </div>
            
            {/* Results */}
            <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
              <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 bg-gradient-to-br ${currentGame.gradient}`}>
                <span className="text-3xl text-white">🏆</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
              <p className="text-gray-600 mb-6">You completed: <span className="font-bold text-green-600">{currentGame.title}</span></p>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-green-600 mb-1">Final Score</p>
                    <p className="text-3xl font-bold text-green-700">{gameResult.score}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-green-600 mb-1">Points Earned</p>
                    <p className="text-3xl font-bold text-green-700">+{gameResult.points}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="font-semibold text-green-700">Total Points: {totalPoints.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleBackToGames}
                  className="bg-green-500 text-white px-6 py-3 rounded-2xl font-medium hover:bg-green-600 transition-colors"
                >
                  Play More Games
                </button>
                <Link
                  href="/customer/rewards"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors text-center"
                >
                  View Rewards
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Game Playing Screen
        <div>
          {/* Game Header */}
          <div className="bg-white shadow-sm border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${currentGame.gradient} rounded-2xl flex items-center justify-center`}>
                  <span className="text-white text-xl">{currentGame.icon}</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">{currentGame.title}</h1>
                  <p className="text-sm text-gray-600">{currentGame.description}</p>
                </div>
              </div>
              <button
                onClick={handleBackToGames}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
          
          {/* Game Area */}
          <div className="p-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 shadow-sm">
              <currentGame.component onGameComplete={handleGameComplete} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}