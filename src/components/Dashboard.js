import React, { useContext, useEffect, useState } from 'react';
import { TestContext } from '../contexts/TestContext';
import { AuthContext } from '../contexts/AuthContext';

const Dashboard = ({ onNavigate }) => {
    const { user, apiCall } = useContext(AuthContext);
    const { 
        testData, 
        userStats, 
        getRecentTests, 
        calculateAverageScore, 
        getBestScore, 
        getConcentrationLevel 
    } = useContext(TestContext);
    
    const [recommendations, setRecommendations] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    useEffect(() => {
        if (user) {
            loadRecommendations();
            loadAIAnalysis();
        }
    }, [user, testData]);

    const loadRecommendations = async () => {
        try {
            setLoadingRecommendations(true);
            const data = await apiCall(`/user/${user.id}/recommendations`);
            setRecommendations(data.recommendations);
        } catch (error) {
            console.error('Error loading recommendations:', error);
            // Fallback recommendations
            setRecommendations([
                'Take regular breaks during study sessions',
                'Practice mindfulness exercises to improve focus',
                'Ensure adequate sleep for optimal concentration'
            ]);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const loadAIAnalysis = async () => {
        const allTests = [...testData.vision, ...testData.hearing];
        if (allTests.length < 3) return;

        try {
            const analysis = await apiCall(`/user/${user.id}/ai-analysis`);
            setAiAnalysis(analysis);
        } catch (error) {
            console.error('Error loading AI analysis:', error);
        }
    };

    const concentrationLevel = getConcentrationLevel();
    const recentTests = getRecentTests();
    const visionTestCount = testData.vision.length;
    const hearingTestCount = testData.hearing.length;
    const avgScore = calculateAverageScore();
    const bestScore = getBestScore();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreClass = (percentage) => {
        if (percentage >= 90) return 'excellent';
        if (percentage >= 75) return 'good';
        if (percentage >= 60) return 'average';
        if (percentage >= 40) return 'needs-improvement';
        return 'poor';
    };

    return (
        <div className="dashboard">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Welcome back, {user?.name}! Track your concentration progress.</p>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <button 
                    className="quick-action-btn"
                    onClick={() => onNavigate('vision-test')}
                >
                    <i className="fas fa-eye"></i>
                    <span>Start Vision Test</span>
                </button>
                <button 
                    className="quick-action-btn"
                    onClick={() => onNavigate('hearing-test')}
                >
                    <i className="fas fa-headphones"></i>
                    <span>Start Hearing Test</span>
                </button>
                <button 
                    className="quick-action-btn"
                    onClick={() => onNavigate('analysis')}
                >
                    <i className="fas fa-chart-line"></i>
                    <span>View Progress</span>
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-eye"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{visionTestCount}</h3>
                        <p>Vision Tests Completed</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-headphones"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{hearingTestCount}</h3>
                        <p>Hearing Tests Completed</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-percentage"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{avgScore}%</h3>
                        <p>Average Score</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-trophy"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{bestScore}%</h3>
                        <p>Best Score</p>
                    </div>
                </div>
            </div>

            {/* Concentration Level Indicator */}
            <div className="concentration-indicator">
                <h2>Current Concentration Level</h2>
                <div className="concentration-meter">
                    <div 
                        className="concentration-bar"
                        style={{ 
                            width: `${avgScore}%`,
                            backgroundColor: concentrationLevel.color 
                        }}
                    ></div>
                    <div className="concentration-labels">
                        <span>Poor</span>
                        <span>Average</span>
                        <span>Good</span>
                        <span>Excellent</span>
                    </div>
                </div>
                <p 
                    className="concentration-message"
                    style={{ color: concentrationLevel.color }}
                >
                    {concentrationLevel.message}
                </p>
            </div>

            <div className="dashboard-content">
                {/* AI Analysis */}
                {aiAnalysis && (
                    <div className="ai-analysis-card">
                        <h2>🤖 AI Analysis</h2>
                        <p className="analysis-summary">{aiAnalysis.analysis}</p>
                        <div className="insights">
                            {aiAnalysis.insights.map((insight, index) => (
                                <div key={index} className="insight-item">
                                    {insight}
                                </div>
                            ))}
                        </div>
                        <div className="analysis-metrics">
                            <div className="metric">
                                <span>Trend:</span>
                                <span className={`trend ${aiAnalysis.trend}`}>
                                    {aiAnalysis.trend}
                                </span>
                            </div>
                            <div className="metric">
                                <span>Strongest Area:</span>
                                <span>{aiAnalysis.strongest_area}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                <div className="recommendations-card">
                    <h2>💡 Personalized Recommendations</h2>
                    {loadingRecommendations ? (
                        <div className="loading">Loading recommendations...</div>
                    ) : (
                        <ul className="recommendations-list">
                            {recommendations.map((recommendation, index) => (
                                <li key={index} className="recommendation-item">
                                    {recommendation}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recent Tests */}
                <div className="recent-tests">
                    <h2>Recent Test Results</h2>
                    {recentTests.length === 0 ? (
                        <p className="no-tests">
                            No tests completed yet. Start with a vision or hearing test!
                        </p>
                    ) : (
                        <div className="tests-list">
                            {recentTests.map((test, index) => (
                                <div key={index} className="test-result-item">
                                    <div className="test-info">
                                        <div className="test-type">
                                            <i className={`fas fa-${test.type === 'vision' ? 'eye' : 'headphones'}`}></i>
                                            <span>{test.type.charAt(0).toUpperCase() + test.type.slice(1)} Test</span>
                                        </div>
                                        <div className="test-details">
                                            <span className="test-level">
                                                {test.level.charAt(0).toUpperCase() + test.level.slice(1)}
                                            </span>
                                            <span className="test-date">
                                                {formatDate(test.date)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`test-score ${getScoreClass(test.percentage)}`}>
                                        {test.percentage}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;