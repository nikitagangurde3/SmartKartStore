import React, { useState } from 'react'; // Remove useEffect from here
import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { FaUserPlus, FaCheckCircle, FaUser, FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    // SIMPLE CLEANUP FUNCTION - No useEffect needed
    const cleanupModal = () => {
        // Remove any leftover modal backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 0) {
            backdrops.forEach(backdrop => {
                if (backdrop && backdrop.parentNode) {
                    backdrop.remove();
                }
            });
        }

        // Reset body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Clean up before submitting
        cleanupModal();

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        if (!name.trim()) {
            setError('Please enter your name');
            setLoading(false);
            return;
        }

        if (!email.trim()) {
            setError('Please enter your email');
            setLoading(false);
            return;
        }

        try {
            // Call real API endpoint
            const response = await api.post('/auth/register', {
                name,
                email,
                password
            });

            console.log('Registration response:', response.data);

            if (response.data && response.data.token) {
                // Store user data and token
                const userInfo = {
                    id: response.data.id,
                    email: response.data.email,
                    name: response.data.name,
                    role: response.data.role || 'Customer'
                };

                setUserData(userInfo);
                setSuccess(true);

                // Auto login after registration
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(userInfo));

                // Clean up after successful registration
                setTimeout(cleanupModal, 100);

                // Show success message for 3 seconds then redirect
                setTimeout(() => {
                    navigate('/');
                    // Refresh page to update auth state
                    window.location.reload();
                }, 3000);
            } else {
                throw new Error('Registration failed - no token received');
            }
        } catch (err) {
            console.error('Registration error:', err);

            // Clean up on error too
            cleanupModal();

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.errors) {
                // Handle validation errors from API
                const errors = err.response.data.errors;
                const errorMessages = Object.values(errors).flat().join(', ');
                setError(errorMessages);
            } else if (err.message.includes('Network Error')) {
                setError('Cannot connect to server. Please check your internet connection.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Also run cleanup when component renders
    cleanupModal();

    if (success) {
        return (
            <div className="auth-page">
                <Container className="text-center py-5">
                    <Card className="border-0 shadow-lg" style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <Card.Body className="p-5">
                            <div className="display-1 text-success mb-4">
                                <FaCheckCircle />
                            </div>
                            <h2 className="mb-3">Registration Successful! 🎉</h2>
                            <p className="mb-4">
                                Welcome to SmartKart, {userData?.name}! Your account has been created successfully.
                            </p>
                            <div className="mb-4">
                                <p className="mb-2"><strong>Account Details:</strong></p>
                                <p className="mb-1">Name: {userData?.name}</p>
                                <p className="mb-1">Email: {userData?.email}</p>
                                <p className="mb-0">Role: {userData?.role}</p>
                            </div>
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted">Redirecting to homepage...</p>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={6} md={8}>
                        <Card className="border-0 shadow-lg">
                            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">
                                    <FaUserPlus className="me-2" />
                                    Create Account
                                </h4>
                                <Button
                                    as={Link}
                                    to="/login"
                                    variant="outline-light"
                                    size="sm"
                                    className="d-flex align-items-center"
                                    onClick={cleanupModal}
                                >
                                    <FaArrowLeft className="me-1" />
                                    Back to Login
                                </Button>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {error && (
                                    <Alert variant="danger" className="text-center">
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <FaUser className="me-2" />
                                            Full Name
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={loading}
                                            minLength={2}
                                            maxLength={100}
                                        />
                                        <Form.Text className="text-muted">
                                            Your name as you want it to appear on your account
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <FaEnvelope className="me-2" />
                                            Email Address
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                        <Form.Text className="text-muted">
                                            We'll never share your email with anyone else
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <FaLock className="me-2" />
                                            Password
                                        </Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter password (min. 6 characters)"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                            minLength={6}
                                        />
                                        <Form.Text className="text-muted">
                                            Password must be at least 6 characters long
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <FaLock className="me-2" />
                                            Confirm Password
                                        </Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Confirm your password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                            minLength={6}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Check
                                            type="checkbox"
                                            id="terms"
                                            label={
                                                <>
                                                    I agree to the{' '}
                                                    <a href="/terms" className="text-primary" target="_blank" rel="noopener noreferrer">
                                                        Terms of Service
                                                    </a>
                                                    {' '}and{' '}
                                                    <a href="/privacy" className="text-primary" target="_blank" rel="noopener noreferrer">
                                                        Privacy Policy
                                                    </a>
                                                </>
                                            }
                                            required
                                        />
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 py-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                <FaUserPlus className="me-2" />
                                                Create Account
                                            </>
                                        )}
                                    </Button>
                                </Form>

                                <div className="text-center mt-4 pt-3 border-top">
                                    <p className="mb-2">Already have an account?</p>
                                    <Button
                                        as={Link}
                                        to="/login"
                                        variant="outline-primary"
                                        className="w-100"
                                        onClick={cleanupModal}
                                    >
                                        Sign In to Your Account
                                    </Button>
                                </div>

                                <div className="mt-4 text-center">
                                    <small className="text-muted">
                                        By registering, you agree to receive promotional emails from SmartKart.
                                        You can unsubscribe at any time.
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Register;