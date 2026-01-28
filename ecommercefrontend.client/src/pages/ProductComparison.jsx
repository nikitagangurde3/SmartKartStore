import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Table, Button,
    Card, Badge, Alert, Form, Modal
} from 'react-bootstrap';
import {
    FaShoppingCart, FaHeart, FaTrash,
    FaStar, FaPlus, FaChartBar, FaExchangeAlt
} from 'react-icons/fa';
import api from '../services/api';

const ProductComparison = () => {
    const [comparisonProducts, setComparisonProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchComparisonHistory();
        fetchAllProducts();
    }, []);

    const fetchComparisonHistory = async () => {
        try {
            setLoading(true);
            // For now, use mock data. Replace with actual API call
            const mockComparison = [
                {
                    id: 1,
                    name: 'iPhone 15 Pro',
                    price: 999,
                    brand: 'Apple',
                    categoryName: 'Smartphones',
                    images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1693009279096'],
                    specifications: {
                        display: '6.7-inch Super Retina XDR',
                        processor: 'A17 Pro chip',
                        ram: '8GB',
                        storage: '256GB',
                        camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
                        battery: '4422 mAh',
                        os: 'iOS 17',
                        weight: '221g'
                    }
                },
                {
                    id: 2,
                    name: 'Samsung Galaxy S24 Ultra',
                    price: 1299,
                    brand: 'Samsung',
                    categoryName: 'Smartphones',
                    images: ['https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-s928-sm-s928bzvdinu-535866960'],
                    specifications: {
                        display: '6.8-inch Dynamic AMOLED 2X',
                        processor: 'Snapdragon 8 Gen 3',
                        ram: '12GB',
                        storage: '512GB',
                        camera: '200MP Main + 50MP Periscope + 12MP Ultra Wide + 10MP Telephoto',
                        battery: '5000 mAh',
                        os: 'Android 14',
                        weight: '232g'
                    }
                }
            ];
            setComparisonProducts(mockComparison);
        } catch (error) {
            console.error('Failed to fetch comparison data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllProducts = async () => {
        try {
            const response = await api.get('/products');
            setAllProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const addToComparison = (product) => {
        if (comparisonProducts.length >= 4) {
            alert('Maximum 4 products can be compared at once');
            return;
        }

        if (!comparisonProducts.some(p => p.id === product.id)) {
            setComparisonProducts([...comparisonProducts, product]);
        }
        setShowProductModal(false);
    };

    const removeFromComparison = (productId) => {
        setComparisonProducts(prev => prev.filter(p => p.id !== productId));
    };

    const getSpecWinner = (spec, products) => {
        const values = products.map(p => p.specifications?.[spec] || '');
        // Simple comparison logic - can be enhanced
        return values[0] > values[1] ? 0 : values[1] > values[0] ? 1 : -1;
    };

    const clearComparison = () => {
        setComparisonProducts([]);
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading comparison...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">
                    <FaChartBar className="me-2 text-primary" />
                    Product Comparison
                </h1>
                <div>
                    <Button
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => setShowProductModal(true)}
                    >
                        <FaPlus className="me-1" />
                        Add Product
                    </Button>
                    {comparisonProducts.length > 0 && (
                        <Button
                            variant="outline-danger"
                            onClick={clearComparison}
                        >
                            <FaTrash className="me-1" />
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {comparisonProducts.length === 0 ? (
                <Card className="text-center py-5 border-0 shadow-sm">
                    <Card.Body>
                        <div className="display-1 mb-4 text-muted">
                            <FaExchangeAlt />
                        </div>
                        <h4 className="mb-3">No Products to Compare</h4>
                        <p className="text-muted mb-4">
                            Add products to compare their specifications and features side by side
                        </p>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => setShowProductModal(true)}
                        >
                            <FaPlus className="me-2" />
                            Add Products to Compare
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <>
                    {/* Product Cards */}
                    <Row className="mb-5">
                        {comparisonProducts.map((product, index) => (
                            <Col key={product.id} md={12 / comparisonProducts.length} className="mb-4">
                                <Card className="h-100 border-0 shadow-sm position-relative">
                                    <div className="position-absolute top-0 end-0 m-2">
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => removeFromComparison(product.id)}
                                            className="rounded-circle"
                                            style={{ width: '36px', height: '36px' }}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </div>
                                    <Card.Img
                                        variant="top"
                                        src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=Product'}
                                        className="product-image"
                                        alt={product.name}
                                    />
                                    <Card.Body className="text-center">
                                        <Badge bg="secondary" className="mb-2">
                                            {product.brand}
                                        </Badge>
                                        <Card.Title className="mb-2">{product.name}</Card.Title>
                                        <Card.Text className="text-primary h4 mb-3">
                                            ₹{product.price}
                                        </Card.Text>
                                        <div className="d-grid gap-2">
                                            <Button variant="primary" size="sm">
                                                <FaShoppingCart className="me-1" />
                                                Add to Cart
                                            </Button>
                                            <Button variant="outline-secondary" size="sm">
                                                <FaHeart className="me-1" />
                                                Wishlist
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Comparison Table */}
                    <Card className="mb-4 border-0 shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                                <FaChartBar className="me-2" />
                                Detailed Specifications Comparison
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-end">Specification</th>
                                        {comparisonProducts.map(product => (
                                            <th key={product.id} className="text-center">
                                                {product.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {['price', 'display', 'processor', 'ram', 'storage', 'camera', 'battery', 'os', 'weight'].map(spec => (
                                        <tr key={spec}>
                                            <td className="fw-bold border-end">
                                                {spec.charAt(0).toUpperCase() + spec.slice(1)}
                                            </td>
                                            {comparisonProducts.map((product, idx) => {
                                                const value = product.specifications?.[spec] ||
                                                    (spec === 'price' ? `₹${product.price}` : 'N/A');
                                                const winner = getSpecWinner(spec, comparisonProducts);

                                                return (
                                                    <td
                                                        key={product.id}
                                                        className={`text-center ${winner === idx ? 'table-success' : ''
                                                            }`}
                                                    >
                                                        {value}
                                                        {winner === idx && (
                                                            <Badge bg="success" className="ms-2">
                                                                Best
                                                            </Badge>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    {/* Summary Card */}
                    {comparisonProducts.length === 2 && (
                        <Card className="border-0 shadow-sm bg-gradient text-white"
                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <Card.Body className="text-center py-4">
                                <h4 className="mb-3">Which one should you choose?</h4>
                                <Row>
                                    <Col md={6}>
                                        <Card className="bg-white text-dark">
                                            <Card.Body>
                                                <h5>{comparisonProducts[0].name}</h5>
                                                <p className="mb-0">
                                                    Best for: {comparisonProducts[0].price < comparisonProducts[1].price ? 'Budget buyers' : 'Premium users'}
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6}>
                                        <Card className="bg-white text-dark">
                                            <Card.Body>
                                                <h5>{comparisonProducts[1].name}</h5>
                                                <p className="mb-0">
                                                    Best for: {comparisonProducts[1].price < comparisonProducts[0].price ? 'Budget buyers' : 'Premium users'}
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}
                </>
            )}

            {/* Add Product Modal */}
            <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Add Product to Comparison</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row xs={2} md={3} className="g-3">
                        {allProducts
                            .filter(p => !comparisonProducts.some(cp => cp.id === p.id))
                            .slice(0, 12)
                            .map(product => (
                                <Col key={product.id}>
                                    <Card
                                        className="h-100 product-card"
                                        onClick={() => addToComparison(product)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Card.Img
                                            variant="top"
                                            src={product.images?.[0] || 'https://via.placeholder.com/150x100?text=Product'}
                                            style={{ height: '100px', objectFit: 'contain' }}
                                        />
                                        <Card.Body className="p-2">
                                            <Card.Title className="fs-6 mb-1">{product.name}</Card.Title>
                                            <Card.Text className="text-primary mb-1">
                                                ₹{product.price}
                                            </Card.Text>
                                            <small className="text-muted">{product.brand}</small>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                    </Row>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ProductComparison;