import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Row, Col, Card, Button, Form,
    Carousel, Badge, Spinner, Alert, Toast
} from 'react-bootstrap';
import {
    FaSearch, FaShoppingCart, FaHeart,
    FaStar, FaFire, FaMobileAlt,
    FaLaptop, FaTabletAlt, FaHeadphones,
    FaTruck, FaSyncAlt, FaShieldAlt, FaUser,
    FaCreditCard, FaBoxOpen, FaGift, FaCheckCircle
} from 'react-icons/fa';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [showWelcomeToast, setShowWelcomeToast] = useState(false);
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        checkUserLogin();
        fetchProducts();
        fetchCategories();

        if (location.state?.loginSuccess) {
            setShowWelcomeToast(true);
            setWelcomeMessage(location.state.welcomeMessage || 'Welcome back!');
            setTimeout(() => setShowWelcomeToast(false), 5000);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const checkUserLogin = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                console.log('Home: Loaded user', parsedUser);
                setUser(parsedUser);
            } catch {
                console.error('Home: Error parsing user data');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/products');
            console.log('Products API response:', response);

            // Handle different response formats
            let productsData = [];
            if (response && response.data) {
                if (Array.isArray(response.data)) {
                    productsData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    productsData = response.data.data;
                } else if (response.data.products && Array.isArray(response.data.products)) {
                    productsData = response.data.products;
                }
            }

            if (productsData.length > 0) {
                setProducts(productsData);
                setFeaturedProducts(productsData.slice(0, 6));
            } else {
                // Fallback to mock data
                setMockData();
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Failed to fetch products. Please try again.');
            setMockData();
        } finally {
            setLoading(false);
        }
    };

    const setMockData = () => {
        const mockProducts = [
            {
                id: 1,
                name: 'iPhone 15 Pro',
                price: 999.99,
                brand: 'Apple',
                categoryName: 'Smartphones',
                images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1693009279096'],
                stock: 10,
                description: 'Latest iPhone with advanced features'
            },
            {
                id: 2,
                name: 'MacBook Pro 16"',
                price: 2499.99,
                brand: 'Apple',
                categoryName: 'Laptops',
                images: ['https://www.apple.com/v/macbook-pro-14-and-16/b/images/overview/hero/hero_intro_endframe__e6khcva4hkeq_large.jpg'],
                stock: 5,
                description: 'Professional laptop for creators'
            },
            {
                id: 3,
                name: 'Samsung Galaxy S24',
                price: 899.99,
                brand: 'Samsung',
                categoryName: 'Smartphones',
                images: ['https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-s928-sm-s928bzvdinu-535866960'],
                stock: 15,
                description: 'Flagship Android smartphone'
            },
            {
                id: 4,
                name: 'Dell XPS 15',
                price: 1899.99,
                brand: 'Dell',
                categoryName: 'Laptops',
                images: ['https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/notebook-xps-15-9530-nt-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=536&qlt=100,1&resMode=sharp2&size=536,402&chrss=full'],
                stock: 8,
                description: 'Premium Windows laptop'
            }
        ];
        setProducts(mockProducts);
        setFeaturedProducts(mockProducts.slice(0, 3));
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories');
            console.log('Categories API response:', response);

            // Handle different response formats
            let categoriesData = [];
            if (response && response.data) {
                if (Array.isArray(response.data)) {
                    categoriesData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    categoriesData = response.data.data;
                } else if (response.data.categories && Array.isArray(response.data.categories)) {
                    categoriesData = response.data.categories;
                }
            }

            if (categoriesData.length > 0) {
                setCategories(categoriesData);
            } else {
                // Fallback to default categories
                setCategories([
                    { id: 1, name: 'Smartphones', productCount: 10 },
                    { id: 2, name: 'Laptops', productCount: 8 },
                    { id: 3, name: 'Tablets', productCount: 6 },
                    { id: 4, name: 'Accessories', productCount: 15 }
                ]);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setCategories([
                { id: 1, name: 'Smartphones', productCount: 10 },
                { id: 2, name: 'Laptops', productCount: 8 },
                { id: 3, name: 'Tablets', productCount: 6 },
                { id: 4, name: 'Accessories', productCount: 15 }
            ]);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    };

    const handleAddToCart = (productId) => {
        if (!user) {
            alert('Please login to add items to cart!');
            navigate('/login');
            return;
        }

        const product = products.find(p => p.id === productId);
        if (product) {
            alert(`✅ ${product.name} added to cart!`);
        }
        console.log('Added to cart:', productId);
    };

    const handleAddToWishlist = (productId) => {
        if (!user) {
            alert('Please login to add items to wishlist!');
            navigate('/login');
            return;
        }

        const product = products.find(p => p.id === productId);
        if (product) {
            alert(`❤️ ${product.name} added to wishlist!`);
        }
        console.log('Added to wishlist:', productId);
    };

    const handleAdminPanel = () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token) {
            alert('Please login first');
            navigate('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData || '{}');
            const userRole = parsedUser.role?.toLowerCase();

            if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else {
                alert('Access denied. Admin privileges required.');
            }
        } catch (error) {
            console.error('Error checking user permissions:', error);
            alert('Error checking user permissions');
            navigate('/login');
        }
    };

    const categoryIcons = {
        'Smartphones': <FaMobileAlt />,
        'Laptops': <FaLaptop />,
        'Tablets': <FaTabletAlt />,
        'Accessories': <FaHeadphones />,
        'Wearables': <FaMobileAlt />,
        'Gaming': <FaLaptop />
    };

    return (
        <div className="home-page">
            {/* Welcome Toast */}
            <Toast
                show={showWelcomeToast}
                onClose={() => setShowWelcomeToast(false)}
                delay={5000}
                autohide
                className="position-fixed top-0 end-0 m-3"
                style={{ zIndex: 9999, minWidth: '300px' }}
                bg="success"
            >
                <Toast.Header closeButton className="bg-success text-white">
                    <strong className="me-auto">
                        <FaCheckCircle className="me-2" />
                        Login Successful!
                    </strong>
                </Toast.Header>
                <Toast.Body className="text-white">
                    {welcomeMessage}
                    <div className="mt-2">
                        <small>🎉 Shopping features are now enabled!</small>
                    </div>
                </Toast.Body>
            </Toast>

            {/* Hero Section */}
            <div className="hero-section text-white">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <h1 className="hero-title fade-in">
                                Welcome {user ? `back, ${user.name}` : 'to'} <span className="text-warning">Smart Kart</span>
                            </h1>
                            <p className="hero-subtitle fade-in">
                                {user
                                    ? 'Ready to shop? All features are now unlocked! 🎉'
                                    : 'Discover amazing electronics at unbeatable prices. Login to unlock all features!'}
                            </p>

                            {user && (
                                <div className="user-quick-actions mb-4 fade-in">
                                    <div className="d-flex flex-wrap gap-2">
                                        <Button
                                            variant="light"
                                            className="d-flex align-items-center"
                                            onClick={() => navigate('/cart')}
                                        >
                                            <FaShoppingCart className="me-2" />
                                            View Cart
                                        </Button>
                                        <Button
                                            variant="outline-light"
                                            className="d-flex align-items-center"
                                            onClick={() => navigate('/wishlist')}
                                        >
                                            <FaHeart className="me-2" />
                                            Wishlist
                                        </Button>
                                        <Button
                                            variant="outline-light"
                                            className="d-flex align-items-center"
                                            onClick={() => navigate('/orders')}
                                        >
                                            <FaBoxOpen className="me-2" />
                                            My Orders
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="search-bar fade-in">
                                <Form onSubmit={handleSearch}>
                                    <div className="input-group">
                                        <Form.Control
                                            type="text"
                                            placeholder="Search smartphones, laptops, tablets..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="border-0"
                                        />
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            className="border-0"
                                        >
                                            <FaSearch className="me-2" />
                                            Search
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <Carousel className="hero-carousel">
                                <Carousel.Item>
                                    <img
                                        className="d-block w-100 rounded"
                                        src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                        alt="Smartphones"
                                        style={{ height: '300px', objectFit: 'cover' }}
                                    />
                                </Carousel.Item>
                                <Carousel.Item>
                                    <img
                                        className="d-block w-100 rounded"
                                        src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                        alt="Laptops"
                                        style={{ height: '300px', objectFit: 'cover' }}
                                    />
                                </Carousel.Item>
                            </Carousel>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Main Content */}
            <Container className="py-5">
                {/* User Status Card */}
                {user && (
                    <Card className="mb-5 border-success shadow-sm">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col md={8}>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-success text-white rounded-circle p-3 me-3">
                                            <FaUser size={24} />
                                        </div>
                                        <div>
                                            <h4 className="mb-1">Welcome, {user.name}! 👋</h4>
                                            <p className="text-muted mb-0">
                                                You're logged in as {user.email}.
                                                {user.role?.toLowerCase() === 'admin' && ' (Admin Privileges)'}
                                            </p>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={4} className="text-md-end mt-3 mt-md-0">
                                    <Button
                                        variant="outline-success"
                                        className="me-2"
                                        onClick={() => navigate('/cart')}
                                    >
                                        Go to Cart
                                    </Button>
                                    {user.role?.toLowerCase() === 'admin' && (
                                        <Button
                                            variant="success"
                                            onClick={handleAdminPanel}
                                        >
                                            Admin Panel
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                )}

                {/* Categories Section */}
                <section className="mb-5">
                    <h2 className="mb-4" style={{ color: '#212529' }}>
                        <FaFire className="me-2 text-danger" />
                        Shop by Category
                    </h2>
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Loading categories...</p>
                        </div>
                    ) : (
                        <Row xs={2} md={4} className="g-4">
                            {categories.map(category => (
                                <Col key={category.id || category.name}>
                                    <Card className="category-card text-center h-100">
                                        <div className="category-icon">
                                            {categoryIcons[category.name] || <FaMobileAlt />}
                                        </div>
                                        <Card.Body>
                                            <Card.Title className="text-dark">{category.name}</Card.Title>
                                            <Card.Text className="text-muted">
                                                {category.productCount || 0} products
                                            </Card.Text>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => navigate(`/products?category=${category.name}`)}
                                            >
                                                Shop Now
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </section>

                {/* Featured Products */}
                <section className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0 text-dark">
                            <FaStar className="me-2 text-warning" />
                            Featured Products
                        </h2>
                        <Button variant="link" onClick={() => navigate('/products')}>
                            View All →
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-dark">Loading products...</p>
                        </div>
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {featuredProducts.map(product => (
                                <Col key={product.id}>
                                    <ProductCard
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                        onAddToWishlist={handleAddToWishlist}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}
                </section>

                {/* Special Offers - FIXED WHITE TEXT */}
                <section className="mb-5">
                    <Card className="border-0 bg-gradient text-white special-offer-card"
                        style={{
                            background: 'linear-gradient(135deg, #ff6b00 0%, #ff0000 100%)',
                            borderRadius: '15px'
                        }}>
                        <Card.Body className="text-center py-5">
                            <h3 className="display-4 mb-3 text-white">🔥 FLASH SALE! 🔥</h3>
                            <p className="lead mb-4 fs-4 text-white">
                                Get up to 40% OFF on all smartphones this week!
                            </p>
                            <Button
                                variant="light"
                                size="lg"
                                className="px-5"
                                onClick={() => navigate('/products?category=Smartphones')}
                            >
                                <FaShoppingCart className="me-2" />
                                Shop Now
                            </Button>
                        </Card.Body>
                    </Card>
                </section>

                {/* Why Choose Us Section - FIXED WHITE TEXT */}
                <section className="mb-5">
                    <h2 className="text-center mb-5 text-dark">
                        <FaStar className="me-2 text-warning" />
                        Why Choose Smart Kart?
                    </h2>
                    <Row className="g-4">
                        <Col md={4}>
                            <Card className="text-center border-0 shadow-sm h-100 hover-shadow">
                                <Card.Body className="py-4">
                                    <div className="display-4 mb-3 text-primary">
                                        <FaTruck />
                                    </div>
                                    <Card.Title className="mb-3 text-dark">Free Shipping</Card.Title>
                                    <Card.Text className="text-muted">
                                        Free delivery on orders above ₹199. Fast & reliable shipping across the country.
                                    </Card.Text>
                                    <Badge bg="success" className="mt-2">Most Popular</Badge>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="text-center border-0 shadow-sm h-100 hover-shadow">
                                <Card.Body className="py-4">
                                    <div className="display-4 mb-3 text-warning">
                                        <FaSyncAlt />
                                    </div>
                                    <Card.Title className="mb-3 text-dark">Easy Returns</Card.Title>
                                    <Card.Text className="text-muted">
                                        30-day hassle-free return policy on all products. No questions asked.
                                    </Card.Text>
                                    <Badge bg="info" className="mt-2">Risk-Free</Badge>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="text-center border-0 shadow-sm h-100 hover-shadow">
                                <Card.Body className="py-4">
                                    <div className="display-4 mb-3 text-success">
                                        <FaShieldAlt />
                                    </div>
                                    <Card.Title className="mb-3 text-dark">Warranty</Card.Title>
                                    <Card.Text className="text-muted">
                                        1-year comprehensive warranty on all electronics. Genuine products guaranteed.
                                    </Card.Text>
                                    <Badge bg="primary" className="mt-2">Peace of Mind</Badge>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Additional Features Row */}
                    <Row className="g-4 mt-3">
                        <Col md={3}>
                            <Card className="text-center border-0 shadow-sm h-100">
                                <Card.Body className="py-3">
                                    <div className="mb-3 text-primary">
                                        <FaCreditCard size={30} />
                                    </div>
                                    <Card.Title className="mb-2 fs-6 text-dark">Secure Payment</Card.Title>
                                    <Card.Text className="text-muted small">
                                        100% secure payment processing
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center border-0 shadow-sm h-100">
                                <Card.Body className="py-3">
                                    <div className="mb-3 text-danger">
                                        <FaHeadphones size={30} />
                                    </div>
                                    <Card.Title className="mb-2 fs-6 text-dark">24/7 Support</Card.Title>
                                    <Card.Text className="text-muted small">
                                        Round-the-clock customer service
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center border-0 shadow-sm h-100">
                                <Card.Body className="py-3">
                                    <div className="mb-3 text-info">
                                        <FaGift size={30} />
                                    </div>
                                    <Card.Title className="mb-2 fs-6 text-dark">Gift Cards</Card.Title>
                                    <Card.Text className="text-muted small">
                                        Perfect gift for your loved ones
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center border-0 shadow-sm h-100">
                                <Card.Body className="py-3">
                                    <div className="mb-3 text-purple">
                                        <FaBoxOpen size={30} />
                                    </div>
                                    <Card.Title className="mb-2 fs-6 text-dark">Track Orders</Card.Title>
                                    <Card.Text className="text-muted small">
                                        Real-time order tracking
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </section>

                {/* Trust Badges Section - FIXED WHITE TEXT */}
                <section className="my-5 py-4 border-top">
                    <Container>
                        <h5 className="text-center mb-4 text-muted">TRUSTED BY THOUSANDS OF CUSTOMERS</h5>
                        <Row className="align-items-center text-center">
                            <Col xs={6} md={3} className="mb-4">
                                <div className="bg-light p-3 rounded">
                                    <h2 className="text-primary mb-1">10K+</h2>
                                    <p className="text-muted mb-0 small">Happy Customers</p>
                                </div>
                            </Col>
                            <Col xs={6} md={3} className="mb-4">
                                <div className="bg-light p-3 rounded">
                                    <h2 className="text-primary mb-1">5K+</h2>
                                    <p className="text-muted mb-0 small">Products</p>
                                </div>
                            </Col>
                            <Col xs={6} md={3} className="mb-4">
                                <div className="bg-light p-3 rounded">
                                    <h2 className="text-primary mb-1">50+</h2>
                                    <p className="text-muted mb-0 small">Brands</p>
                                </div>
                            </Col>
                            <Col xs={6} md={3} className="mb-4">
                                <div className="bg-light p-3 rounded">
                                    <h2 className="text-primary mb-1">24/7</h2>
                                    <p className="text-muted mb-0 small">Support</p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Final Trust Section - FIXED WHITE TEXT */}
                <section className="mt-5 pt-5 border-top">
                    <Container>
                        <Row className="text-center">
                            <Col md={4} className="mb-4">
                                <div className="bg-light p-4 rounded shadow-sm">
                                    <h5 className="text-primary">🛡️ Secure Payment</h5>
                                    <p className="text-muted mb-0">100% secure payment processing</p>
                                </div>
                            </Col>
                            <Col md={4} className="mb-4">
                                <div className="bg-light p-4 rounded shadow-sm">
                                    <h5 className="text-primary">🚚 Fast Delivery</h5>
                                    <p className="text-muted mb-0">Free shipping on orders above ₹199</p>
                                </div>
                            </Col>
                            <Col md={4} className="mb-4">
                                <div className="bg-light p-4 rounded shadow-sm">
                                    <h5 className="text-primary">🔄 Easy Returns</h5>
                                    <p className="text-muted mb-0">30-day return policy</p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>
            </Container>
        </div>
    );
};

export default Home;