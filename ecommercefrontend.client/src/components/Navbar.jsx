import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Navbar, Nav, Container, Button,
    Badge, Dropdown, Form, InputGroup,
    Modal, ListGroup
} from 'react-bootstrap';
import {
    FaShoppingCart,
    FaUser,
    FaSignOutAlt,
    FaHome,
    FaBalanceScale,
    FaSearch,
    FaUserCircle,
    FaBox,
    FaTimes,
    FaTimesCircle
} from 'react-icons/fa';
import api from '../services/api';

const NavigationBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        checkAuth();
        fetchCartCount();

        // Listen for auth changes
        window.addEventListener('authChange', checkAuth);

        return () => {
            window.removeEventListener('authChange', checkAuth);
        };
    }, []);

    // Update auth state when location changes
    useEffect(() => {
        checkAuth();
    }, [location.pathname]);

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setIsAuthenticated(true);
                setUser(parsedUser);
                console.log('Navbar: User authenticated', parsedUser);
            } catch {
                setIsAuthenticated(false);
                setUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    const fetchCartCount = async () => {
        // For now, use localStorage cart
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
    };

    useEffect(() => {
        const handleCartUpdate = () => {
            fetchCartCount();
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, []);

    const handleLogout = () => {
        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart'); // Clear cart on logout

        // Update state
        setIsAuthenticated(false);
        setUser(null);
        setCartCount(0);

        // Dispatch auth change event
        window.dispatchEvent(new Event('authChange'));

        // Navigate to home
        navigate('/');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setShowSearchModal(false);
            navigate('/products');
            return;
        }

        navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
        setShowSearchModal(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleLiveSearch = async (value) => {
        setSearchTerm(value);

        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setSearchLoading(true);
            const response = await api.get(`/products/search/${value}`);
            setSearchResults(response.data.slice(0, 5));
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAdminPanel = () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token) {
            alert('Please login to access admin panel');
            navigate('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData || '{}');
            if (parsedUser.role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                alert('Access denied. Admin privileges required.');
            }
        } catch (error) {
            alert('Error checking user permissions');
            navigate('/login');
        }
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="py-3">
                <Container>
                    {/* Brand Logo */}
                    <Navbar.Brand as={Link} to="/" className="fw-bold fs-3">
                        <span className="text-warning">Smart</span>Kart
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="navbar-nav" />

                    <Navbar.Collapse id="navbar-nav">
                        {/* Navigation Links */}
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/" className="mx-2">
                                <FaHome className="me-1" />
                                Home
                            </Nav.Link>

                            <Nav.Link as={Link} to="/products" className="mx-2">
                                <FaBox className="me-1" />
                                Products
                            </Nav.Link>

                            <Nav.Link as={Link} to="/compare" className="mx-2">
                                <FaBalanceScale className="me-1" />
                                Compare
                            </Nav.Link>
                        </Nav>

                        {/* Search Bar */}
                        <div className="mx-3 flex-grow-1" style={{ maxWidth: '500px' }}>
                            <Form onSubmit={handleSearch}>
                                <InputGroup>
                                    <Form.Control
                                        type="search"
                                        placeholder="Search products, brands, categories..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            handleLiveSearch(e.target.value);
                                        }}
                                        className="border-end-0"
                                        onClick={() => setShowSearchModal(true)}
                                        onFocus={() => setShowSearchModal(true)}
                                        ref={searchInputRef}
                                    />
                                    {searchTerm && (
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setSearchResults([]);
                                            }}
                                            className="border-end-0"
                                        >
                                            <FaTimes />
                                        </Button>
                                    )}
                                    <Button
                                        variant="warning"
                                        type="submit"
                                        className="border-start-0"
                                    >
                                        <FaSearch />
                                    </Button>
                                </InputGroup>
                            </Form>
                        </div>

                        {/* User Actions */}
                        <Nav className="ms-3 align-items-center">
                            <Nav.Link as={Link} to="/cart" className="mx-2 position-relative">
                                <FaShoppingCart />
                                {cartCount > 0 && (
                                    <Badge
                                        pill
                                        bg="danger"
                                        className="position-absolute top-0 start-100 translate-middle"
                                    >
                                        {cartCount}
                                    </Badge>
                                )}
                            </Nav.Link>

                            {isAuthenticated ? (
                                <Dropdown align="end">
                                    <Dropdown.Toggle variant="outline-light" id="user-dropdown">
                                        <FaUserCircle className="me-2" />
                                        {user?.name || 'User'}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item as={Link} to="/profile">
                                            <FaUser className="me-2" />
                                            Profile
                                        </Dropdown.Item>
                                        <Dropdown.Item as={Link} to="/orders">
                                            My Orders
                                        </Dropdown.Item>
                                        {user?.role === 'Admin' && (
                                            <Dropdown.Item onClick={handleAdminPanel}>
                                                Admin Panel
                                            </Dropdown.Item>
                                        )}
                                        <Dropdown.Divider />
                                        <Dropdown.Item onClick={handleLogout}>
                                            <FaSignOutAlt className="me-2" />
                                            Logout
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            ) : (
                                <>
                                    <Button
                                        variant="outline-light"
                                        as={Link}
                                        to="/login"
                                        className="mx-2"
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant="warning"
                                        as={Link}
                                        to="/register"
                                    >
                                        Register
                                    </Button>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
};

export default NavigationBar;