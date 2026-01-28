import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaFilter, FaSortAmountDown, FaShoppingCart, FaStar } from 'react-icons/fa';
import api from '../services/api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // Get query parameters
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState(category || '');
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState([0, 5000]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [location.search]); // Re-fetch when URL changes

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError('');

            // Build query parameters
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (search) params.append('search', search);

            const queryString = params.toString();
            const url = queryString ? `/products?${queryString}` : '/products';

            const response = await api.get(url);
            setProducts(response.data);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const handleAddToCart = (productId) => {
        console.log('Add to cart:', productId);
        // Implement cart functionality
    };

    const handleAddToWishlist = (productId) => {
        console.log('Add to wishlist:', productId);
        // Implement wishlist functionality
    };

    // Filter and sort products
    const filteredProducts = products.filter(product => {
        if (selectedCategory && product.categoryName !== selectedCategory) {
            return false;
        }
        if (product.price < priceRange[0] || product.price > priceRange[1]) {
            return false;
        }
        return true;
    });

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

    return (
        <Container className="py-4">
            {/* Header */}
            <div className="mb-4">
                <h2 className="mb-2">
                    {category ? `${category}` : 'All Products'}
                </h2>
                <p className="text-muted">
                    {products.length} products found
                    {category && ` in ${category}`}
                </p>
            </div>

            <Row>
                {/* Sidebar Filters */}
                <Col lg={3} className="mb-4">
                    <Card className="sticky-top" style={{ top: '20px' }}>
                        <Card.Header className="bg-light">
                            <h5 className="mb-0">
                                <FaFilter className="me-2" />
                                Filters
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {/* Categories Filter */}
                            <div className="mb-4">
                                <h6 className="mb-3">Categories</h6>
                                <Form>
                                    {categories.map(cat => (
                                        <Form.Check
                                            key={cat.id}
                                            type="radio"
                                            id={`cat-${cat.id}`}
                                            label={`${cat.name} (${cat.productCount})`}
                                            name="category"
                                            checked={selectedCategory === cat.name}
                                            onChange={() => setSelectedCategory(cat.name)}
                                            className="mb-2"
                                        />
                                    ))}
                                    <Form.Check
                                        type="radio"
                                        id="cat-all"
                                        label="All Categories"
                                        name="category"
                                        checked={!selectedCategory}
                                        onChange={() => setSelectedCategory('')}
                                    />
                                </Form>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-4">
                                <h6 className="mb-3">Price Range</h6>
                                <Form.Label>
                                    ₹{priceRange[0]} - ${priceRange[1]}
                                </Form.Label>
                                <Form.Range
                                    min="0"
                                    max="5000"
                                    step="100"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                />
                                <div className="d-flex justify-content-between">
                                    <small>₹0</small>
                                    <small>₹5000</small>
                                </div>
                            </div>

                            {/* Sort Options */}
                            <div className="mb-3">
                                <h6 className="mb-3">Sort By</h6>
                                <Form.Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name">Name: A to Z</option>
                                </Form.Select>
                            </div>

                            {/* Clear Filters */}
                            <Button
                                variant="outline-secondary"
                                className="w-100"
                                onClick={() => {
                                    setSelectedCategory('');
                                    setPriceRange([0, 5000]);
                                    setSortBy('featured');
                                }}
                            >
                                Clear All Filters
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Products Grid */}
                <Col lg={9}>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3">Loading products...</p>
                        </div>
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                    ) : sortedProducts.length === 0 ? (
                        <Card className="text-center py-5">
                            <Card.Body>
                                <h5 className="text-muted">No products found</h5>
                                <p>Try adjusting your filters or search term</p>
                                <Button variant="primary" onClick={() => {
                                    setSelectedCategory('');
                                    setPriceRange([0, 5000]);
                                }}>
                                    Clear Filters
                                </Button>
                            </Card.Body>
                        </Card>
                    ) : (
                        <>
                            {/* Results Header */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <Badge bg="primary" className="me-2">
                                        {sortedProducts.length} Items
                                    </Badge>
                                    <Badge bg="secondary" className="me-2">
                                        {sortBy.replace('-', ' ')}
                                    </Badge>
                                </div>
                                <div>
                                    <FaSortAmountDown className="me-2" />
                                    <small>Sorted by {sortBy.replace('-', ' ')}</small>
                                </div>
                            </div>

                            {/* Products Grid */}
                            <Row xs={1} md={2} lg={3} className="g-4">
                                {sortedProducts.map(product => (
                                    <Col key={product.id}>
                                        <Card className="h-100 product-card">
                                            <div className="position-relative">
                                                <Card.Img
                                                    variant="top"
                                                    src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=Product+Image'}
                                                    className="product-image"
                                                    alt={product.name}
                                                />
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="position-absolute top-0 end-0 m-2 rounded-circle"
                                                    style={{ width: '36px', height: '36px' }}
                                                    onClick={() => handleAddToWishlist(product.id)}
                                                >
                                                    <FaStar />
                                                </Button>
                                                {product.stock < 10 && product.stock > 0 && (
                                                    <Badge bg="warning" className="position-absolute top-0 start-0 m-2">
                                                        Only {product.stock} left
                                                    </Badge>
                                                )}
                                                {product.stock === 0 && (
                                                    <Badge bg="danger" className="position-absolute top-0 start-0 m-2">
                                                        Out of Stock
                                                    </Badge>
                                                )}
                                            </div>
                                            <Card.Body className="d-flex flex-column">
                                                <div className="mb-2">
                                                    <Badge bg="secondary" className="me-1">
                                                        {product.brand}
                                                    </Badge>
                                                    <Badge bg="light" text="dark" className="me-1">
                                                        {product.categoryName}
                                                    </Badge>
                                                </div>
                                                <Card.Title className="mb-2" style={{ fontSize: '1rem', height: '3rem' }}>
                                                    {product.name}
                                                </Card.Title>
                                                <Card.Text className="text-muted small flex-grow-1" style={{ height: '3rem' }}>
                                                    {product.description.substring(0, 80)}...
                                                </Card.Text>
                                                <div className="d-flex justify-content-between align-items-center mt-3">
                                                    <span className="h5 text-primary mb-0">
                                                        ₹{product.price.toFixed(2)}
                                                    </span>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleAddToCart(product.id)}
                                                        disabled={product.stock === 0}
                                                    >
                                                        <FaShoppingCart className="me-1" />
                                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {/* Pagination (optional) */}
                            {sortedProducts.length > 0 && (
                                <div className="d-flex justify-content-center mt-5">
                                    <nav>
                                        <ul className="pagination">
                                            <li className="page-item disabled">
                                                <span className="page-link">Previous</span>
                                            </li>
                                            <li className="page-item active">
                                                <span className="page-link">1</span>
                                            </li>
                                            <li className="page-item">
                                                <a className="page-link" href="#">
                                                    2
                                                </a>
                                            </li>
                                            <li className="page-item">
                                                <a className="page-link" href="#">
                                                    3
                                                </a>
                                            </li>
                                            <li className="page-item">
                                                <a className="page-link" href="#">
                                                    Next
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Products;