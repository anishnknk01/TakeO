'use client';

import { useState, useEffect } from 'react';

interface SpinWheelGameProps {
  onGameComplete: (score: number, points: number) => void;
}

interface WheelSegment {
  label: string;
  points: number;
  color: string;
  emoji: string;
}

export function SpinWheelGame({ onGameComplete }: SpinWheelGameProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [totalPoints, setTotalPoints] = useState(0);
  const [finalRotation, setFinalRotation] = useState(0);

  const wheelSegments: WheelSegment[] = [
    { label: 'Jackpot!', points: 500, color: '#FFD700', emoji: '💰' },
    { label: 'Big Win', points: 300, color: '#FF6B6B', emoji: '🎉' },
    { label: 'Lucky', points: 150, color: '#4ECDC4', emoji: '🍀' },
    { label: 'Nice!', points: 100, color: '#45B7D1', emoji: '✨' },
    { label: 'Good', points: 75, color: '#96CEB4', emoji: '👍' },
    { label: 'Try Again', points: 25, color: '#FFEAA7', emoji: '🔄' },
    { label: 'Small Win', points: 50, color: '#DDA0DD', emoji: '🎯' },
    { label: 'Bonus!', points: 200, color: '#FF7675', emoji: '🎁' }
  ];

  const spinWheel = () => {
    if (isSpinning || spinsLeft === 0) return;
    
    if (!gameStarted) setGameStarted(true);
    
    setIsSpinning(true);
    setResult(null);
    setSpinsLeft(prev => prev - 1);
    
    // Generate random rotation (5-10 full rotations + random position)
    const spins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const newRotation = rotation + spins * 360 + randomAngle;
    setRotation(newRotation);
    setFinalRotation(newRotation);
    
    setTimeout(() => {
      // Calculate which segment we landed on
      const normalizedRotation = (360 - (newRotation % 360) + 360) % 360;
      const segmentAngle = 360 / wheelSegments.length;
      const segmentIndex = Math.floor(normalizedRotation / segmentAngle);
      const winningSegment = wheelSegments[segmentIndex];
      
      setResult(winningSegment);
      setTotalPoints(prev => prev + winningSegment.points);
      setIsSpinning(false);
      
      // End game if no spins left
      if (spinsLeft === 1) {
        setTimeout(() => {
          onGameComplete(totalPoints + winningSegment.points, totalPoints + winningSegment.points);
        }, 2000);
      }
    }, 4000);
  };

  if (!gameStarted) {
    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">🎡 Fortune Wheel</h3>
          <p className="text-lg text-gray-600 mb-6">
            Spin the magical wheel and win instant points!
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 max-w-md mx-auto">
            <h4 className="font-semibold text-purple-800 mb-3">🎮 Game Rules:</h4>
            <ul className="text-sm text-purple-700 space-y-2 text-left">
              <li>• You get 3 spins to maximize your points</li>
              <li>• Each spin can win 25-500 points</li>
              <li>• Points accumulate across all spins</li>
              <li>• Aim for the golden Jackpot segment! 💰</li>
            </ul>
          </div>
        </div>
        <button
          onClick={spinWheel}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl font-bold text-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105"
        >
          Start Spinning 🎡
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Game Stats */}
      <div className="flex justify-center items-center gap-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">{spinsLeft}</div>
          <div className="text-sm text-gray-600 font-medium">Spins Left</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">{totalPoints}</div>
          <div className="text-sm text-gray-600 font-medium">Total Points</div>
        </div>
      </div>

      {/* Wheel Container */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-20">
            <div className="relative">
              {/* Orange pointer triangle */}
              <div 
                className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent"
                style={{ borderBottomColor: '#FF8C42' }}
              ></div>
              {/* Pointer glow effect */}
              <div className="absolute inset-0 w-0 h-0 border-l-[22px] border-r-[22px] border-b-[37px] border-l-transparent border-r-transparent opacity-50 -top-1"
                   style={{ borderBottomColor: '#FFB366' }}></div>
            </div>
          </div>
          
          {/* Outer ring with dots */}
          <div className="relative w-96 h-96">
            {/* Decorative dots around the wheel */}
            {[...Array(16)].map((_, index) => {
              const angle = (360 / 16) * index;
              const radius = 200; // Distance from center
              const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
              const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
              
              return (
                <div
                  key={index}
                  className="absolute w-3 h-3 bg-yellow-300 rounded-full shadow-lg"
                  style={{
                    left: `calc(50% + ${x}px - 6px)`,
                    top: `calc(50% + ${y}px - 6px)`,
                  }}
                ></div>
              );
            })}
            
            {/* Main wheel */}
            <div 
              className="absolute inset-4 rounded-full border-8 border-blue-800 shadow-2xl transition-transform ease-out overflow-hidden"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transitionDuration: isSpinning ? '4000ms' : '0ms'
              }}
            >
              {/* Wheel segments */}
              {wheelSegments.map((segment, index) => {
                const angle = 360 / wheelSegments.length;
                const startAngle = angle * index;
                
                return (
                  <div
                    key={index}
                    className="absolute inset-0"
                    style={{
                      transform: `rotate(${startAngle}deg)`,
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(Math.PI * angle / 180)}% ${50 + 50 * Math.sin(Math.PI * angle / 180)}%)`
                    }}
                  >
                    <div 
                      className="w-full h-full relative"
                      style={{ backgroundColor: segment.color }}
                    >
                      {/* Segment content */}
                      <div 
                        className="absolute text-white font-bold"
                        style={{
                          top: '25%',
                          left: '50%',
                          transform: `translate(-50%, 0) rotate(${angle / 2}deg)`,
                          transformOrigin: 'center'
                        }}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">{segment.emoji}</div>
                          <div className="text-xs font-semibold">{segment.points}</div>
                          <div className="text-xs">{segment.label}</div>
                        </div>
                      </div>
                      
                      {/* Inner gradient for depth */}
                      <div 
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              {/* Center hub */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center border-4 border-blue-700 shadow-xl">
                  <span className="text-white font-bold text-lg">SPIN</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spin Button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning || spinsLeft === 0}
          className={`mt-8 px-10 py-4 rounded-2xl font-bold text-xl shadow-2xl transition-all transform ${
            isSpinning || spinsLeft === 0
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed scale-95'
              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 hover:scale-105 hover:shadow-red-500/25'
          }`}
        >
          {isSpinning ? 'Spinning... 🌪️' : spinsLeft > 0 ? `Spin the Wheel! (${spinsLeft} left)` : 'Game Complete! 🎉'}
        </button>
      </div>

      {/* Result Display */}
      {result && !isSpinning && (
        <div className="text-center">
          <div className="inline-block relative">
            <div 
              className="px-8 py-6 rounded-2xl text-white shadow-2xl border-4 border-white/30 transform scale-110"
              style={{ backgroundColor: result.color }}
            >
              <div className="text-5xl mb-3">{result.emoji}</div>
              <div className="text-2xl font-bold mb-2">{result.label}</div>
              <div className="text-xl">+{result.points} Points!</div>
              
              {/* Sparkle effects */}
              <div className="absolute -top-2 -right-2 text-yellow-300 text-2xl animate-pulse">✨</div>
              <div className="absolute -bottom-2 -left-2 text-yellow-300 text-2xl animate-pulse">✨</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Spinning effects */}
      {isSpinning && (
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
            <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-purple-600 font-semibold">Spinning the wheel of fortune...</span>
          </div>
        </div>
      )}
    </div>
  );
}