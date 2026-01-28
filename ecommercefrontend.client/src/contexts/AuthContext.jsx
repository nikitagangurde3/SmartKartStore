import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing auth data on load
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        // Ensure role is set correctly
        const userWithRole = {
            ...userData,
            role: userData.role || 'Customer'
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        setUser(userWithRole);

        // Dispatch event for navbar update
        window.dispatchEvent(new Event('authChange'));
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        setUser(null);

        // Dispatch events for UI updates
        window.dispatchEvent(new Event('authChange'));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Admin',
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};