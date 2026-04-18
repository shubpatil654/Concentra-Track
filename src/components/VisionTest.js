import React, { useState, useEffect } from 'react';
import { useTest } from '../contexts/TestContext';
import { visionPatterns } from '../data/testData';

const VisionTest = () => {
  const { currentTest, setCurrentTest, saveTestResult } = useTest();
  const [testState, setTestState] = useState('menu'); // 'menu', 'testing', 'results'
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const timeLimit = {
    easy: 20,
    medium: 10,
    hard: 5
  };

  const startTest = (level) => {
    const questions = [...visionPatterns[level]];
    const newTest = {
      type: 'vision',
      level: level,
      questions: questions,
      currentQuestion: 0,
      score: 0,
      answers: [],
      timeLeft: timeLimit[level]
    };
    
    setCurrentTest(newTest);
    setTestState('testing');
    setSelectedOption(null);
    setShowFeedback(false);
  };

  useEffect(() => {
    let timer;
    if (testState === 'testing' && currentTest.timeLeft > 0) {
      timer = setTimeout(() => {
        setCurrentTest(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (testState === 'testing' && currentTest.timeLeft === 0) {
      handleAnswer(-1); // Time's up, no answer selected
    }
    
    return () => clearTimeout(timer);
  }, [testState, currentTest.timeLeft, setCurrentTest]);

  const handleAnswer = (optionIndex) => {
    if (showFeedback) return;

    const question = currentTest.questions[currentTest.currentQuestion];
    const isCorrect = optionIndex === question.correct;
    
    const newAnswer = {
      question: currentTest.currentQuestion,
      selected: optionIndex,
      correct: question.correct,
      isCorrect: isCorrect
    };

    setCurrentTest(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      answers: [...prev.answers, newAnswer]
    }));

    setSelectedOption(optionIndex);
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    const nextQuestionIndex = currentTest.currentQuestion + 1;
    
    if (nextQuestionIndex >= currentTest.questions.length) {
      finishTest();
    } else {
      setCurrentTest(prev => ({
        ...prev,
        currentQuestion: nextQuestionIndex,
        timeLeft: timeLimit[prev.level]
      }));
      setSelectedOption(null);
      setShowFeedback(false);
    }
  };

  const finishTest = () => {
    const percentage = Math.round((currentTest.score / currentTest.questions.length) * 100);
    
    const result = {
      type: 'vision',
      level: currentTest.level,
      score: currentTest.score,
      total: currentTest.questions.length,
      percentage: percentage,
      answers: currentTest.answers
    };
    
    saveTestResult(result);
    setTestState('results');
  };

  const resetTest = () => {
    setTestState('menu');
    setCurrentTest({
      type: null,
      level: null,
      questions: [],
      currentQuestion: 0,
      score: 0,
      answers: [],
      timeLeft: 0
    });
  };

  const LevelCard = ({ level, time, description }) => (
    <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 capitalize">{level}</h3>
      <p className="text-gray-600 mb-2">{time} seconds per question</p>
      <p className="text-gray-600 mb-6">{description}</p>
      <button
        onClick={() => startTest(level)}
        className="w-full bg-gradient-primary text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
      >
        Start {level.charAt(0).toUpperCase() + level.slice(1)} Test
      </button>
    </div>
  );

  if (testState === 'menu') {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Vision Test</h1>
          <p className="text-white/80 text-lg">Test your pattern recognition skills</p>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Select Difficulty Level</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LevelCard
              level="easy"
              time="20"
              description="Simple patterns"
            />
            <LevelCard
              level="medium"
              time="10"
              description="Moderate patterns"
            />
            <LevelCard
              level="hard"
              time="5"
              description="Complex patterns"
            />
          </div>
        </div>
      </div>
    );
  }

  if (testState === 'testing') {
    const question = currentTest.questions[currentTest.currentQuestion];
    
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Vision Test</h1>
          <p className="text-white/80 text-lg">Level: {currentTest.level.charAt(0).toUpperCase() + currentTest.level.slice(1)}</p>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
          {/* Test Header */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-gray-200">
            <div className="text-gray-700 font-semibold">
              Question {currentTest.currentQuestion + 1} of {currentTest.questions.length}
            </div>
            <div className={`px-6 py-2 rounded-full font-bold text-lg ${
              currentTest.timeLeft <= 5 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {currentTest.timeLeft}s
            </div>
          </div>

          {/* Pattern Display */}
          <div className="text-center mb-8">
            <div className="bg-gray-100 border-4 border-gray-300 rounded-2xl p-12 mx-auto w-80 h-80 flex items-center justify-center">
              <div className="text-5xl font-bold text-gray-800">
                {question.pattern}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showFeedback}
                className={`p-6 border-4 rounded-xl text-2xl font-bold transition-all duration-200 ${
                  showFeedback
                    ? index === question.correct
                      ? 'border-green-500 bg-green-500 text-white'
                      : index === selectedOption && selectedOption !== question.correct
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-gray-300 bg-white text-gray-700'
                    : selectedOption === index
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary-500 hover:bg-primary-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Next Button */}
          {showFeedback && (
            <div className="text-center">
              <button
                onClick={nextQuestion}
                className="bg-gradient-primary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {currentTest.currentQuestion + 1 >= currentTest.questions.length ? 'Finish Test' : 'Next Question'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (testState === 'results') {
    const percentage = Math.round((currentTest.score / currentTest.questions.length) * 100);
    
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Vision Test Results</h1>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-xl text-center">
          <div className="mb-8">
            <div className={`text-6xl font-bold mb-4 ${
              percentage >= 80 ? 'text-green-500' :
              percentage >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {percentage}%
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Test Complete!</h2>
          </div>

          <div className="bg-gray-100 rounded-2xl p-6 mb-8 max-w-md mx-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Score:</span>
                <span className="text-gray-800 font-bold">{currentTest.score}/{currentTest.questions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Percentage:</span>
                <span className="text-gray-800 font-bold">{percentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Level:</span>
                <span className="text-gray-800 font-bold capitalize">{currentTest.level}</span>
              </div>
            </div>
          </div>

          <button
            onClick={resetTest}
            className="bg-gradient-primary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Take Another Test
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default VisionTest;