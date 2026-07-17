'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface QuickTapGameProps {
  onGameComplete: (score: number, points: number) => void;
}

interface Target {
  id: number;
  emoji: string;
  name: string;
  x: number;
  y: number;
  isCorrect: boolean;
  size: number;
}

export function QuickTapGame({ onGameComplete }: QuickTapGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [currentTarget, setCurrentTarget] = useState<string>('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const correctFoods = ['🍛', '🥘', '🍞', '🥟', '🍲', '🌶️', '🥥', '🧄'];
  const wrongFoods = ['🍔', '🍕', '🌭', '🍟', '🥪', '🌮', '🍗', '🥓'];
  const foodNames: { [key: string]: string } = {
    '🍛': 'Biryani', '🥘': 'Curry', '🍞': 'Naan', '🥟': 'Samosa',
    '🍲': 'Dal', '🌶️': 'Chili', '🥥': 'Coconut', '🧄': 'Garlic',
    '🍔': 'Burger', '🍕': 'Pizza', '🌭': 'Hot Dog', '🍟': 'Fries',
    '🥪': 'Sandwich', '🌮': 'Taco', '🍗': 'Chicken', '🥓': 'Bacon'
  };

  const generateTargets = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const newTargets: Target[] = [];
    const area = gameAreaRef.current.getBoundingClientRect();
    const targetCount = 6 + Math.floor(Math.random() * 4); // 6-9 targets
    
    // Pick random correct target
    const correctFood = correctFoods[Math.floor(Math.random() * correctFoods.length)];
    setCurrentTarget(correctFood);
    
    // Add 1-2 correct targets
    const correctCount = Math.random() < 0.7 ? 1 : 2;
    for (let i = 0; i < correctCount; i++) {
      newTargets.push({
        id: Math.random(),
        emoji: correctFood,
        name: foodNames[correctFood],
        x: Math.random() * 80 + 5, // 5-85% to avoid edges
        y: Math.random() * 70 + 10, // 10-80% to avoid edges
        isCorrect: true,
        size: 60 + Math.random() * 20 // 60-80px
      });
    }
    
    // Fill rest with wrong targets
    const wrongCount = targetCount - correctCount;
    for (let i = 0; i < wrongCount; i++) {
      let wrongFood;
      do {
        wrongFood = [...correctFoods, ...wrongFoods][Math.floor(Math.random() * (correctFoods.length + wrongFoods.length))];
      } while (wrongFood === correctFood);
      
      newTargets.push({
        id: Math.random(),
        emoji: wrongFood,
        name: foodNames[wrongFood],
        x: Math.random() * 80 + 5,
        y: Math.random() * 70 + 10,
        isCorrect: false,
        size: 60 + Math.random() * 20
      });
    }
    
    setTargets(newTargets);
  }, []);

  const handleTargetClick = (target: Target) => {
    if (!gameStarted || gameOver) return;
    
    if (target.isCorrect) {
      const points = 100 + (streak * 10); // Bonus for streaks
      setScore(prev => prev + points);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      
      // Generate new targets immediately
      setTimeout(generateTargets, 100);
    } else {
      // Wrong target - lose points and reset streak
      setScore(prev => Math.max(0, prev - 25));
      setStreak(0);
    }
  };

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
      const finalPoints = Math.floor(score / 10) + (maxStreak * 5) + 25;
      setTimeout(() => {
        onGameComplete(score, finalPoints);
      }, 1500);
    }
  }, [gameStarted, timeLeft, gameOver, score, maxStreak, onGameComplete]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(30);
    setGameOver(false);
    generateTargets();
  };

  if (!gameStarted) {
    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">⚡ Quick Tap Challenge</h3>
          <p className="text-lg text-gray-600 mb-6">
            Tap only the Indian dishes as fast as you can! Avoid foreign foods.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <h4 className="font-semibold text-red-800 mb-3">Game Rules:</h4>
            <ul className="text-sm text-red-700 space-y-2 text-left">
              <li>• Tap the highlighted Indian dish when you see it</li>
              <li>• Avoid tapping wrong foods (you'll lose points!)</li>
              <li>• Build streaks for bonus points</li>
              <li>• 30 seconds to get the highest score!</li>
            </ul>
          </div>
        </div>
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
        >
          Start Tapping ⚡
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{timeLeft}</div>
          <div className="text-xs text-gray-500">Seconds Left</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">Tap: {currentTarget} {foodNames[currentTarget]}</div>
          <div className="text-xs text-gray-500">Current Target</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{score}</div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{streak}</div>
          <div className="text-xs text-gray-500">Streak</div>
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="relative bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl h-96 border-2 border-orange-200 overflow-hidden"
      >
        {targets.map((target) => (
          <div
            key={target.id}
            onClick={() => handleTargetClick(target)}
            className={`absolute cursor-pointer transition-all duration-200 hover:scale-110 ${
              target.isCorrect 
                ? 'hover:shadow-lg hover:shadow-green-300' 
                : 'hover:shadow-lg hover:shadow-red-300'
            }`}
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              fontSize: `${target.size}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={`text-center p-2 rounded-full ${
              target.isCorrect 
                ? 'bg-green-200/80 border-2 border-green-400' 
                : 'bg-white/80 border-2 border-gray-300'
            }`}>
              <div>{target.emoji}</div>
              <div className="text-xs font-medium text-gray-700 mt-1">
                {target.name}
              </div>
            </div>
          </div>
        ))}
        
        {/* Streak indicator */}
        {streak > 3 && (
          <div className="absolute top-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-full font-bold animate-pulse">
            🔥 {streak}x Streak!
          </div>
        )}
      </div>

      {gameOver && (
        <div className="text-center py-8">
          <div className="bg-white border-2 border-green-200 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Time's Up!</h3>
            <p className="text-gray-600 mb-4">
              Final Score: {score} points
            </p>
            <p className="text-sm text-purple-600 mb-4">
              Max Streak: {maxStreak}x 🔥
            </p>
            <div className="text-2xl font-bold text-green-600">
              Points Earned: {Math.floor(score / 10) + (maxStreak * 5) + 25}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}