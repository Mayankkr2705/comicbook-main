import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const TOKEN_KEY = 'cb_token';
const USER_KEY = 'cb_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const isAuthenticated = !!user && !!token;

    // On mount, verify the stored token is still valid
    useEffect(() => {
        const verify = async () => {
            if (!token) { setIsLoading(false); return; }
            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
                } else {
                    // Token invalid — clear everything
                    _clear();
                }
            } catch {
                _clear();
            } finally {
                setIsLoading(false);
            }
        };
        verify();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const _save = (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    };

    const _clear = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    };

    const register = async (username, email, password) => {
        setError(null);
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        _save(data.token, data.user);
        return data;
    };

    const login = async (email, password) => {
        setError(null);
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        _save(data.token, data.user);
        return data;
    };

    const logout = useCallback(() => {
        _clear();
    }, []);

    /** Returns the stored local JWT for authenticated API requests. */
    const getAccessToken = useCallback(async () => {
        return token;
    }, [token]);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            isLoading,
            error,
            register,
            login,
            logout,
            getAccessToken
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
