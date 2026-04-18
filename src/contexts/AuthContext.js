import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('concentratrack_token'));

    useEffect(() => {
        // Check if user is logged in on app start
        const savedUser = localStorage.getItem('concentratrack_user');
        const savedToken = localStorage.getItem('concentratrack_token');
        
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
        }
        
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('concentratrack_user', JSON.stringify(data.user));
                localStorage.setItem('concentratrack_token', data.token);
                return data.user;
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('concentratrack_user', JSON.stringify(data.user));
                localStorage.setItem('concentratrack_token', data.token);
                return data.user;
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('concentratrack_user');
        localStorage.removeItem('concentratrack_token');
    };

    const getAuthHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const apiCall = async (endpoint, options = {}) => {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: getAuthHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (response.status === 401) {
                // Token expired or invalid
                logout();
                throw new Error('Session expired. Please login again.');
            }

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        apiCall,
        getAuthHeaders
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };