'use client';

import { useState, useEffect } from 'react';

interface TriviaGameProps {
  onGameComplete: (score: number, points: number) => void;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function TriviaGame({ onGameComplete }: TriviaGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);

  const questions: Question[] = [
    {
      question: "Which spice is known as the 'King of Spices' in Indian cuisine?",
      options: ["Turmeric", "Black Pepper", "Cardamom", "Cinnamon"],
      correctAnswer: 1,
      explanation: "Black pepper is called the 'King of Spices' and was once used as currency!",
      difficulty: 'easy'
    },
    {
      question: "What is the main ingredient in the dish 'Paneer Makhani'?",
      options: ["Chicken", "Cottage Cheese", "Mutton", "Fish"],
      correctAnswer: 1,
      explanation: "Paneer is Indian cottage cheese, and Makhani means 'with butter'.",
      difficulty: 'easy'
    },
    {
      question: "Which city is famous for Hyderabadi Biryani?",
      options: ["Mumbai", "Delhi", "Hyderabad", "Kolkata"],
      correctAnswer: 2,
      explanation: "Hyderabadi Biryani originated in Hyderabad and is cooked using the 'dum' method.",
      difficulty: 'medium'
    },
    {
      question: "What does 'Tandoor' refer to in Indian cooking?",
      options: ["A spice mix", "A clay oven", "A cooking style", "A type of bread"],
      correctAnswer: 1,
      explanation: "Tandoor is a cylindrical clay oven used for baking and roasting in Indian cuisine.",
      difficulty: 'medium'
    },
    {
      question: "Which Indian bread is traditionally cooked in a tandoor?",
      options: ["Chapati", "Naan", "Paratha", "Puri"],
      correctAnswer: 1,
      explanation: "Naan is traditionally cooked by slapping the dough against tandoor walls.",
      difficulty: 'medium'
    },
    {
      question: "What is 'Ghee' made from?",
      options: ["Vegetable oil", "Clarified butter", "Coconut oil", "Mustard oil"],
      correctAnswer: 1,
      explanation: "Ghee is clarified butter with milk solids removed, giving it a high smoke point.",
      difficulty: 'easy'
    },
    {
      question: "Which region of India is famous for 'Rajma Chawal'?",
      options: ["South India", "North India", "East India", "West India"],
      correctAnswer: 1,
      explanation: "Rajma Chawal (kidney beans with rice) is a popular North Indian comfort food.",
      difficulty: 'medium'
    },
    {
      question: "What gives turmeric its characteristic yellow color?",
      options: ["Curcumin", "Capsaicin", "Piperine", "Gingerol"],
      correctAnswer: 0,
      explanation: "Curcumin is the active compound that gives turmeric its golden color and health benefits.",
      difficulty: 'hard'
    },
    {
      question: "Which of these is NOT a traditional Indian sweet?",
      options: ["Gulab Jamun", "Rasgulla", "Baklava", "Jalebi"],
      correctAnswer: 2,
      explanation: "Baklava is a Middle Eastern pastry, not an Indian sweet.",
      difficulty: 'hard'
    },
    {
      question: "What is the base ingredient of 'Sambar'?",
      options: ["Chickpeas", "Lentils (Dal)", "Rice", "Wheat"],
      correctAnswer: 1,
      explanation: "Sambar is a South Indian lentil-based stew with vegetables and tamarind.",
      difficulty: 'medium'
    }
  ];

  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);

  const initializeGame = () => {
    // Randomly select 5 questions
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setGameQuestions(shuffled.slice(0, 5));
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(15);
    setGameOver(false);
  };

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !showResult && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && !gameOver) {
      // Time up, treat as wrong answer
      handleAnswerSubmit();
    }
  }, [gameStarted, timeLeft, showResult, gameOver]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult || gameOver) return;
    setSelectedAnswer(answerIndex);
  };

  const handleAnswerSubmit = () => {
    if (showResult || gameOver) return;
    
    const currentQuestion = gameQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      const points = currentQuestion.difficulty === 'easy' ? 100 : 
                   currentQuestion.difficulty === 'medium' ? 150 : 200;
      const timeBonus = Math.floor(timeLeft * 5); // 5 points per second remaining
      setScore(prev => prev + points + timeBonus);
      setCorrectAnswers(prev => prev + 1);
    }
    
    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestionIndex + 1 >= gameQuestions.length) {
        // Game over
        setGameOver(true);
        const finalPoints = Math.floor(score / 10) + (correctAnswers * 10) + 75;
        setTimeout(() => {
          onGameComplete(score, finalPoints);
        }, 2000);
      } else {
        // Next question
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(15);
      }
    }, 3000);
  };

  const startGame = () => {
    setGameStarted(true);
    initializeGame();
  };

  if (!gameStarted) {
    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🤔 Indian Food Trivia</h3>
          <p className="text-lg text-gray-600 mb-6">
            Test your knowledge about Indian cuisine, spices, and cooking traditions!
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 max-w-md mx-auto">
            <h4 className="font-semibold text-purple-800 mb-3">Game Format:</h4>
            <ul className="text-sm text-purple-700 space-y-2 text-left">
              <li>• 5 random questions about Indian food</li>
              <li>• 15 seconds per question</li>
              <li>• Easy: 100pts, Medium: 150pts, Hard: 200pts</li>
              <li>• Time bonus: 5 points per second remaining</li>
            </ul>
          </div>
        </div>
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
        >
          Start Quiz 🧠
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="text-center py-8">
        <div className="bg-white border-2 border-purple-200 rounded-xl p-8 max-w-md mx-auto">
          <div className="text-4xl mb-4">🎓</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
          <p className="text-gray-600 mb-4">
            You answered {correctAnswers} out of {gameQuestions.length} questions correctly!
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              Final Score: {score}
            </div>
            <div className="text-sm text-purple-600">
              Accuracy: {Math.round((correctAnswers / gameQuestions.length) * 100)}%
            </div>
          </div>
          <div className="text-lg font-bold text-green-600">
            Points Earned: {Math.floor(score / 10) + (correctAnswers * 10) + 75}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = gameQuestions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4">
        <div className="text-sm text-gray-600">
          Question {currentQuestionIndex + 1} of {gameQuestions.length}
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {currentQuestion.difficulty.toUpperCase()}
          </span>
        </div>
        <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
          {timeLeft}s
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="grid gap-3">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = "w-full p-4 text-left rounded-lg border-2 transition-all ";
            
            if (showResult) {
              if (index === currentQuestion.correctAnswer) {
                buttonClass += "border-green-500 bg-green-50 text-green-800";
              } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
                buttonClass += "border-red-500 bg-red-50 text-red-800";
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
              }
            } else {
              if (selectedAnswer === index) {
                buttonClass += "border-purple-500 bg-purple-50 text-purple-800";
              } else {
                buttonClass += "border-gray-200 hover:border-purple-300 hover:bg-purple-50";
              }
            }
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={buttonClass}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        {!showResult && (
          <div className="mt-6 text-center">
            <button
              onClick={handleAnswerSubmit}
              disabled={selectedAnswer === null}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                selectedAnswer !== null
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          </div>
        )}

        {/* Result Explanation */}
        {showResult && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">
              {selectedAnswer === currentQuestion.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
            </div>
            <p className="text-sm text-blue-700">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* Score */}
      <div className="text-center bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4">
        <div className="text-2xl font-bold">Score: {score}</div>
        <div className="text-sm opacity-80">Correct: {correctAnswers}/{currentQuestionIndex + (showResult ? 1 : 0)}</div>
      </div>
    </div>
  );
}