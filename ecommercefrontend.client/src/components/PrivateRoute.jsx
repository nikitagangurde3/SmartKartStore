// Create a new file: src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, requireAdmin = false }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requireAdmin && user?.role !== 'Admin') {
        alert('Access denied. Admin privileges required.');
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;