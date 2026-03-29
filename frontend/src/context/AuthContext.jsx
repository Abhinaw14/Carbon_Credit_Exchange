import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('jwt') || null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!token && !!user;
    const isAdmin = user?.role === 'ADMIN';

    // Persist auth state
    const saveAuth = (jwt, userData) => {
        setToken(jwt);
        setUser(userData);
        localStorage.setItem('jwt', jwt);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const clearAuth = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        localStorage.removeItem('walletConnected');
    };

    // Register
    const register = async (username, password, displayName) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, displayName }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        saveAuth(data.data.token, data.data.user);
        return data.data.user;
    };

    // Login
    const login = async (username, password) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        saveAuth(data.data.token, data.data.user);
        return data.data.user;
    };

    // Logout
    const logout = useCallback(() => {
        clearAuth();
    }, []);

    // Update profile
    const updateProfile = async (fields) => {
        const res = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(fields),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
    };

    // Link wallet
    const linkWallet = async (walletAddress) => {
        const res = await fetch(`${API_URL}/api/auth/link-wallet`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ walletAddress }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
    };

    // Restore session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('jwt');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        register,
        login,
        logout,
        updateProfile,
        linkWallet,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
