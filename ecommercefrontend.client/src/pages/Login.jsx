import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaSignInAlt, FaShoppingCart, FaHeart, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setSuccessMessage('');

        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            console.log('Login API response:', response.data);

            if (response.data && response.data.token) {
                const userData = {
                    id: response.data.id,
                    email: response.data.email,
                    name: response.data.name,
                    role: response.data.role || 'Customer'
                };

                console.log('User data to store:', userData);

                // Use the AuthContext login function
                login(userData, response.data.token);

                // Show success message
                setSuccessMessage('Login successful! Redirecting...');

                // Add 1.5 second delay before navigation
                setTimeout(() => {
                    // Navigate based on role
                    if (userData.role === 'Admin') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/', {
                            state: {
                                loginSuccess: true,
                                welcomeMessage: `Welcome back, ${userData.name}!`
                            }
                        });
                    }
                }, 1500);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    const handleDemoLogin = (isAdmin = false) => {
        if (isAdmin) {
            setEmail('admin@example.com');
            setPassword('Admin@123');
        } else {
            setEmail('user@example.com');
            setPassword('User@123');
        }
    };

    return (
        <div className="auth-page">
            <Container className="py-5">
                <Row className="justify-content-center align-items-center">
                    <Col xl={10} lg={10} md={12}>
                        <div className="shadow-lg rounded-4 overflow-hidden">
                            <Row className="g-0">
                                {/* Login Form Side */}
                                <Col lg={6} className="bg-white p-5">
                                    <div className="text-center mb-4">
                                        <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-3">
                                            <FaSignInAlt size={30} />
                                        </div>
                                        <h2 className="fw-bold text-primary">Welcome Back</h2>
                                        <p className="text-muted">Sign in to continue shopping</p>
                                    </div>

                                    {successMessage && (
                                        <Alert variant="success" className="text-center">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                {successMessage}
                                            </div>
                                        </Alert>
                                    )}

                                    {error && (
                                        <Alert variant="danger" className="text-center">
                                            {error}
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Email Address</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="Enter email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading || !!successMessage}
                                                size="lg"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Enter password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={loading || !!successMessage}
                                                size="lg"
                                            />
                                        </Form.Group>

                                        <Button
                                            variant="primary"
                                            type="submit"
                                            className="w-100 py-3"
                                            disabled={loading || !!successMessage}
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        className="me-2"
                                                    />
                                                    Signing In...
                                                </>
                                            ) : successMessage ? (
                                                'Redirecting...'
                                            ) : (
                                                'Login'
                                            )}
                                        </Button>
                                    </Form>

                                    <div className="text-center mt-4">
                                        <p className="mb-3">
                                            Don't have an account?{' '}
                                            <a href="/register" className="text-primary fw-bold">
                                                Register here
                                            </a>
                                        </p>

                                        <div className="d-flex flex-column gap-2 mt-4">
                                            <Button
                                                variant="outline-primary"
                                                onClick={() => handleDemoLogin(true)}
                                                disabled={loading || !!successMessage}
                                            >
                                                Login as Admin
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => handleDemoLogin(false)}
                                                disabled={loading || !!successMessage}
                                            >
                                                Login as User
                                            </Button>
                                        </div>
                                    </div>
                                </Col>

                                {/* Features Side */}
                                <Col lg={6} className="bg-primary text-white p-5">
                                    <div className="h-100 d-flex flex-column justify-content-center">
                                        <h2 className="mb-4">Smart Kart Features</h2>

                                        <div className="mb-4">
                                            <div className="d-flex align-items-center mb-3">
                                                <FaShoppingCart className="me-3 fs-4" />
                                                <div>
                                                    <h5 className="mb-1">Shopping Cart</h5>
                                                    <p className="mb-0 opacity-90">Save and manage your items</p>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center mb-3">
                                                <FaHeart className="me-3 fs-4" />
                                                <div>
                                                    <h5 className="mb-1">Wishlist</h5>
                                                    <p className="mb-0 opacity-90">Save favorites for later</p>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center mb-3">
                                                <FaUser className="me-3 fs-4" />
                                                <div>
                                                    <h5 className="mb-1">Profile</h5>
                                                    <p className="mb-0 opacity-90">Manage your account</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-top border-white border-opacity-25">
                                            <small className="opacity-75">
                                                <strong>Demo Credentials:</strong><br />
                                                Admin: admin@example.com / Admin@123<br />
                                                User: user@example.com / User@123
                                            </small>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;