'use client';

import { useState, useEffect, useCallback } from 'react';

interface MemoryMatchGameProps {
  onGameComplete: (score: number, points: number) => void;
}

interface Card {
  id: number;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryMatchGame({ onGameComplete }: MemoryMatchGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const foodItems = [
    { emoji: '🍛', name: 'Biryani' },
    { emoji: '🥘', name: 'Curry' },
    { emoji: '🍞', name: 'Naan' },
    { emoji: '🥟', name: 'Samosa' },
    { emoji: '🍲', name: 'Dal' },
    { emoji: '🧄', name: 'Garlic' },
    { emoji: '🌶️', name: 'Chili' },
    { emoji: '🥥', name: 'Coconut' }
  ];

  const initializeGame = useCallback(() => {
    const gameCards: Card[] = [];
    foodItems.forEach((item, index) => {
      // Create pairs
      gameCards.push({
        id: index * 2,
        emoji: item.emoji,
        name: item.name,
        isFlipped: false,
        isMatched: false
      });
      gameCards.push({
        id: index * 2 + 1,
        emoji: item.emoji,
        name: item.name,
        isFlipped: false,
        isMatched: false
      });
    });
    
    // Shuffle cards
    const shuffled = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeLeft(60);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      endGame();
    }
  }, [gameStarted, timeLeft, gameOver]);

  useEffect(() => {
    if (matchedPairs === foodItems.length) {
      endGame();
    }
  }, [matchedPairs]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);
      
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) setGameStarted(true);
    if (flippedCards.length === 2 || gameOver) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    
    setFlippedCards(prev => [...prev, cardId]);
    setMoves(prev => prev + 1);
  };

  const endGame = () => {
    setGameOver(true);
    const score = Math.max(0, matchedPairs * 100 - moves * 2 + timeLeft);
    const points = Math.floor(score / 10) + 50; // Bonus points
    setTimeout(() => {
      onGameComplete(score, points);
    }, 1500);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  if (!gameStarted) {
    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🧠 Memory Match Challenge</h3>
          <p className="text-lg text-gray-600 mb-6">
            Find matching pairs of Indian dishes. You have 60 seconds!
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto">
            <h4 className="font-semibold text-blue-800 mb-3">How to Play:</h4>
            <ul className="text-sm text-blue-700 space-y-2 text-left">
              <li>• Click cards to flip them over</li>
              <li>• Find matching pairs of food items</li>
              <li>• Complete faster with fewer moves for higher score</li>
              <li>• Match all pairs before time runs out!</li>
            </ul>
          </div>
        </div>
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
        >
          Start Playing 🚀
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{timeLeft}</div>
          <div className="text-xs text-gray-500">Time Left</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{matchedPairs}</div>
          <div className="text-xs text-gray-500">Pairs Found</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{moves}</div>
          <div className="text-xs text-gray-500">Moves</div>
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-center text-4xl font-bold ${
              card.isMatched
                ? 'bg-green-100 border-green-300 scale-110'
                : card.isFlipped
                ? 'bg-white border-blue-300 shadow-lg'
                : 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-300 hover:from-gray-300 hover:to-gray-400 hover:scale-105'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              <div className="text-center">
                <div className="text-4xl mb-1">{card.emoji}</div>
                <div className="text-xs text-gray-600">{card.name}</div>
              </div>
            ) : (
              <div className="text-6xl text-gray-400">🍽️</div>
            )}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="text-center py-8">
          <div className="bg-white border-2 border-green-200 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-4xl mb-4">
              {matchedPairs === foodItems.length ? '🎉' : '⏰'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {matchedPairs === foodItems.length ? 'Perfect Match!' : 'Time\'s Up!'}
            </h3>
            <p className="text-gray-600 mb-4">
              You found {matchedPairs} out of {foodItems.length} pairs in {moves} moves!
            </p>
            <div className="text-2xl font-bold text-green-600">
              Final Score: {Math.max(0, matchedPairs * 100 - moves * 2 + timeLeft)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}