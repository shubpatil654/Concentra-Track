import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { visionPatterns, hearingContent, testSettings } from '../data/testData';

// Utility Functions for Shuffling
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const shuffleArrayWithCorrectIndex = (options, correctIndex) => {
    const correctAnswer = options[correctIndex];
    const shuffledOptions = shuffleArray(options);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
    
    return {
        options: shuffledOptions,
        correctIndex: newCorrectIndex
    };
};

const TestContext = createContext();

const TestProvider = ({ children }) => {
    const { user, apiCall } = useContext(AuthContext);
    const [testData, setTestData] = useState({
        vision: [],
        hearing: []
    });
    const [currentTest, setCurrentTest] = useState({
        type: null,
        level: null,
        questions: [],
        currentQuestion: 0,
        score: 0,
        answers: [],
        timer: null,
        timeLeft: 0,
        startTime: null
    });
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load user test data when user changes
    useEffect(() => {
        if (user) {
            loadUserTestData();
            loadUserStats();
        }
    }, [user]);

    const loadUserTestData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const tests = await apiCall(`/user/${user.id}/tests`);
            setTestData({
                vision: tests.filter(t => t.type === 'vision'),
                hearing: tests.filter(t => t.type === 'hearing')
            });
        } catch (error) {
            console.error('Error loading test data:', error);
            // Fallback to localStorage
            const savedData = localStorage.getItem(`testData_${user.id}`);
            if (savedData) {
                setTestData(JSON.parse(savedData));
            }
        } finally {
            setLoading(false);
        }
    };

    const loadUserStats = async () => {
        if (!user) return;

        try {
            const stats = await apiCall(`/user/${user.id}/stats`);
            setUserStats(stats);
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    };

    const startTest = (testType, level) => {
        const questions = testType === 'vision' 
            ? [...visionPatterns[level]] 
            : [...hearingContent[level]];
        
        // Shuffle questions for variety on every test
        const shuffledQuestions = shuffleArray(questions);
        
        // For vision tests, also shuffle the options
        let finalQuestions = shuffledQuestions;
        if (testType === 'vision') {
            finalQuestions = shuffledQuestions.map(question => {
                const shuffledOptions = shuffleArrayWithCorrectIndex(question.options, question.correct);
                return {
                    ...question,
                    options: shuffledOptions.options,
                    correct: shuffledOptions.correctIndex
                };
            });
        }
        
        // Take only the required number of questions
        const questionCount = testSettings[testType][level].questionsCount || 10;
        const selectedQuestions = finalQuestions.slice(0, questionCount);
        
        setCurrentTest({
            type: testType,
            level: level,
            questions: selectedQuestions,
            currentQuestion: 0,
            score: 0,
            answers: [],
            timer: null,
            timeLeft: 0,
            startTime: new Date()
        });

        return selectedQuestions;
    };

    const submitAnswer = (answer, isCorrect = null, timeTaken = null) => {
        const newAnswer = {
            questionIndex: currentTest.currentQuestion,
            answer: answer,
            isCorrect: isCorrect,
            timeTaken: timeTaken,
            timestamp: new Date()
        };

        const updatedAnswers = [...currentTest.answers, newAnswer];
        const updatedScore = isCorrect ? currentTest.score + 1 : currentTest.score;

        setCurrentTest(prev => ({
            ...prev,
            answers: updatedAnswers,
            score: updatedScore
        }));

        return { updatedAnswers, updatedScore };
    };

    const nextQuestion = () => {
        setCurrentTest(prev => ({
            ...prev,
            currentQuestion: prev.currentQuestion + 1
        }));
    };

    const finishTest = async () => {
        const endTime = new Date();
        const totalTime = Math.floor((endTime - currentTest.startTime) / 1000);
        const percentage = Math.round((currentTest.score / currentTest.questions.length) * 100);

        const testResult = {
            userId: user.id,
            type: currentTest.type,
            level: currentTest.level,
            score: currentTest.score,
            total: currentTest.questions.length,
            percentage: percentage,
            time_taken: totalTime,
            answers: currentTest.answers
        };

        try {
            // Save to server
            await apiCall('/test-result', {
                method: 'POST',
                body: JSON.stringify(testResult)
            });

            // Update local state
            const newTestData = {
                ...testData,
                [currentTest.type]: [...testData[currentTest.type], {
                    ...testResult,
                    date: endTime.toISOString()
                }]
            };
            setTestData(newTestData);

            // Save to localStorage as backup
            localStorage.setItem(`testData_${user.id}`, JSON.stringify(newTestData));

            // Reload stats
            await loadUserStats();

            return testResult;
        } catch (error) {
            console.error('Error saving test result:', error);
            
            // Fallback to localStorage
            const testResultWithDate = {
                ...testResult,
                id: Date.now(),
                date: endTime.toISOString()
            };

            const newTestData = {
                ...testData,
                [currentTest.type]: [...testData[currentTest.type], testResultWithDate]
            };
            setTestData(newTestData);
            localStorage.setItem(`testData_${user.id}`, JSON.stringify(newTestData));

            return testResultWithDate;
        }
    };

    const resetTest = () => {
        setCurrentTest({
            type: null,
            level: null,
            questions: [],
            currentQuestion: 0,
            score: 0,
            answers: [],
            timer: null,
            timeLeft: 0,
            startTime: null
        });
    };

    const getRecentTests = (limit = 5) => {
        const allTests = [...testData.vision, ...testData.hearing];
        return allTests
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    };

    const getTestsByType = (type) => {
        return testData[type] || [];
    };

    const getTestsByLevel = (type, level) => {
        return (testData[type] || []).filter(test => test.level === level);
    };

    const calculateAverageScore = (tests = null) => {
        const testsToAnalyze = tests || [...testData.vision, ...testData.hearing];
        if (testsToAnalyze.length === 0) return 0;
        
        const totalScore = testsToAnalyze.reduce((sum, test) => sum + test.percentage, 0);
        return Math.round(totalScore / testsToAnalyze.length);
    };

    const getBestScore = (tests = null) => {
        const testsToAnalyze = tests || [...testData.vision, ...testData.hearing];
        if (testsToAnalyze.length === 0) return 0;
        
        return Math.max(...testsToAnalyze.map(test => test.percentage));
    };

    const getProgressTrend = () => {
        const allTests = [...testData.vision, ...testData.hearing];
        if (allTests.length < 2) return 'neutral';

        const sortedTests = allTests.sort((a, b) => new Date(a.date) - new Date(b.date));
        const recentTests = sortedTests.slice(-5);
        const olderTests = sortedTests.slice(0, -5);

        if (olderTests.length === 0) return 'neutral';

        const recentAvg = calculateAverageScore(recentTests);
        const olderAvg = calculateAverageScore(olderTests);

        if (recentAvg > olderAvg + 5) return 'improving';
        if (recentAvg < olderAvg - 5) return 'declining';
        return 'stable';
    };

    const getConcentrationLevel = () => {
        const avgScore = calculateAverageScore();
        
        if (avgScore >= 90) return { level: 'excellent', color: '#4CAF50', message: 'Excellent concentration!' };
        if (avgScore >= 75) return { level: 'good', color: '#8BC34A', message: 'Good concentration level' };
        if (avgScore >= 60) return { level: 'average', color: '#FFC107', message: 'Average concentration' };
        if (avgScore >= 40) return { level: 'needs_improvement', color: '#FF9800', message: 'Needs improvement' };
        return { level: 'poor', color: '#F44336', message: 'Poor concentration - consider rest' };
    };

    const value = {
        testData,
        currentTest,
        userStats,
        loading,
        startTest,
        submitAnswer,
        nextQuestion,
        finishTest,
        resetTest,
        getRecentTests,
        getTestsByType,
        getTestsByLevel,
        calculateAverageScore,
        getBestScore,
        getProgressTrend,
        getConcentrationLevel,
        loadUserTestData,
        loadUserStats
    };

    return (
        <TestContext.Provider value={value}>
            {children}
        </TestContext.Provider>
    );
};

export { TestContext, TestProvider };