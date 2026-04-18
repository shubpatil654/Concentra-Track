import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { TestProvider } from './contexts/TestContext';
import AuthPage from './components/AuthPage';
import MainApp from './components/MainApp';
import './index.css';

const AppContent = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading ConcentraTrack...</p>
            </div>
        );
    }

    return user ? <MainApp /> : <AuthPage />;
};

const App = () => {
    return (
        <AuthProvider>
            <TestProvider>
                <div className="App">
                    <AppContent />
                </div>
            </TestProvider>
        </AuthProvider>
    );
};

export default App;