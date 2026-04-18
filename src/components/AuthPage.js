import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, register } = useContext(AuthContext);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }
                await register(formData.name, formData.email, formData.password);
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        setError('');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-form">
                    <h2>{isLogin ? 'Login to ConcentraTrack' : 'Sign Up for ConcentraTrack'}</h2>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        )}
                        
                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        {!isLogin && (
                            <div className="form-group">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            className="auth-btn"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                        </button>
                    </form>
                    
                    <p className="auth-switch">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button type="button" onClick={toggleMode} className="link-btn">
                            {isLogin ? 'Sign up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;