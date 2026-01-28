import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductComparison from './pages/ProductComparison';
import AdminDashboard from './pages/Admin/Dashboard';
import './App.css';

// Private Route Component
const PrivateRoute = ({ children, requireAdmin = false }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requireAdmin && user?.role !== 'Admin') {
        // Show alert but stay on current page (or redirect to home)
        alert('Access denied. Admin privileges required.');
        return <Navigate to="/" />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Auth Pages (Full Screen - No Navbar) */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Main Layout (With Navbar) */}
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/compare" element={<ProductComparison />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route
                                path="/checkout"
                                element={
                                    <PrivateRoute>
                                        <Checkout />
                                    </PrivateRoute>
                                }
                            />
                        </Route>

                        {/* Admin Layout (Separate) */}
                        <Route
                            path="/admin/*"
                            element={
                                <PrivateRoute requireAdmin>
                                    <AdminLayout />
                                </PrivateRoute>
                            }
                        >
                            <Route index element={<Navigate to="dashboard" />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                        </Route>

                        {/* 404 Redirect */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;