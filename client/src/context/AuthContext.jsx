import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const setAuthToken = useCallback((token) => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
            localStorage.removeItem('token');
        }
    }, []);
    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
            try {
                const res = await axios.get(`${API_URL}/user`);
                setUser(res.data);
                setIsAuthenticated(true);
            } catch (err) {
                console.error("Failed to load user:", err.response?.data?.msg || err.message);
                setAuthToken(null);
                setIsAuthenticated(false);
            }
        }
        setLoading(false);
    }, [setAuthToken]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            setAuthToken(res.data.token);
            await loadUser(); 
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
            setAuthToken(null);
            setIsAuthenticated(false);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password) => {
         setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/register`, { username, email, password });
            setAuthToken(res.data.token);
            await loadUser();
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
            setAuthToken(null);
            setIsAuthenticated(false);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, loading, error, login, register, logout, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
};