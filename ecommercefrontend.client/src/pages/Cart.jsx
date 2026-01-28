import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Image } from 'react-bootstrap';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import CartService from '../services/cartService';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        const cart = CartService.getCart();
        setCartItems(cart);
    };

    const updateQuantity = (productId, quantity) => {
        CartService.updateQuantity(productId, quantity);
        loadCart();
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const removeItem = (productId) => {
        CartService.removeFromCart(productId);
        loadCart();
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const clearCart = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            CartService.clearCart();
            loadCart();
            window.dispatchEvent(new Event('cartUpdated'));
        }
    };

    const handleCheckout = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to proceed to checkout');
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            alert('Your cart is empty');
            return;
        }

        navigate('/checkout');
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Container className="py-4">
            <h2 className="mb-4">
                <FaShoppingCart className="me-2" />
                Shopping Cart
            </h2>

            {cartItems.length === 0 ? (
                <Card className="text-center py-5">
                    <Card.Body>
                        <div className="display-4 text-muted mb-3">
                            🛒
                        </div>
                        <h5 className="text-muted">Your cart is empty</h5>
                        <p className="text-muted mb-4">Add some products to your cart to see them here</p>
                        <Button variant="primary" as={Link} to="/products">
                            <FaArrowLeft className="me-2" />
                            Continue Shopping
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <>
                    <Row>
                        <Col lg={8}>
                            <Card className="mb-4">
                                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Cart Items ({totalItems})</h5>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={clearCart}
                                    >
                                        <FaTrash className="me-1" />
                                        Clear Cart
                                    </Button>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <Table responsive hover className="mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Product</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Subtotal</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map(item => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <Image
                                                                src={item.image || 'https://via.placeholder.com/50x50?text=Product'}
                                                                alt={item.name}
                                                                className="me-3"
                                                                style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                                                            />
                                                            <div>
                                                                <h6 className="mb-1">{item.name}</h6>
                                                                <small className="text-muted">{item.brand}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>₹{item.price.toFixed(2)}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            >
                                                                -
                                                            </Button>
                                                            <Form.Control
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                                className="mx-2 text-center"
                                                                style={{ width: '60px' }}
                                                                min="1"
                                                            />
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            >
                                                                +
                                                            </Button>
                                                        </div>
                                                    </td>
                                                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                                                    <td>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4}>
                            <Card className="sticky-top" style={{ top: '20px' }}>
                                <Card.Header>
                                    <h5 className="mb-0">Order Summary</h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Total Items:</span>
                                        <span>{totalItems}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span><strong>Total Amount:</strong></span>
                                            <span><strong>₹{totalAmount.toFixed(2)}</strong></span>
                                    </div>

                                    <Alert variant="info" className="small">
                                            <strong>Free Shipping</strong> on orders above ₹199
                                    </Alert>

                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={handleCheckout}
                                            disabled={cartItems.length === 0}
                                        >
                                            <FaCreditCard className="me-2" />
                                            Proceed to Checkout
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            as={Link}
                                            to="/products"
                                        >
                                            <FaArrowLeft className="me-2" />
                                            Continue Shopping
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export default Cart;