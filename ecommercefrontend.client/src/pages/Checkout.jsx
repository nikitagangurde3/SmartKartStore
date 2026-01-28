import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Table } from 'react-bootstrap';
import {
    FaCreditCard, FaPaypal, FaMoneyBillWave,
    FaTruck, FaMapMarkerAlt, FaLock,
    FaCheckCircle, FaShoppingBag, FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CartService from '../services/cartService';

const Checkout = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Form states
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
    });

    const [paymentInfo, setPaymentInfo] = useState({
        method: 'creditCard',
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: ''
    });

    // Cart items from local storage
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to checkout');
            navigate('/login');
            return;
        }

        // Load cart items
        loadCartItems();
    }, [navigate]);

    const loadCartItems = () => {
        const cart = CartService.getCart();
        setCartItems(cart);
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 199 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!shippingInfo.fullName.trim()) {
            setError('Please enter your full name');
            return;
        }
        if (!shippingInfo.email.trim()) {
            setError('Please enter your email');
            return;
        }
        if (!shippingInfo.address.trim()) {
            setError('Please enter your address');
            return;
        }
        if (!shippingInfo.city.trim()) {
            setError('Please enter your city');
            return;
        }
        if (!shippingInfo.state.trim()) {
            setError('Please enter your state');
            return;
        }
        if (!shippingInfo.zipCode.trim()) {
            setError('Please enter your ZIP code');
            return;
        }
        setError('');
        setStep(2);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (paymentInfo.method === 'creditCard') {
            // Basic card validation
            if (!paymentInfo.cardNumber.trim() || paymentInfo.cardNumber.length < 16) {
                setError('Please enter a valid card number');
                return;
            }
            if (!paymentInfo.cardName.trim()) {
                setError('Please enter card holder name');
                return;
            }
            if (!paymentInfo.expiry.trim()) {
                setError('Please enter expiry date');
                return;
            }
            if (!paymentInfo.cvv.trim() || paymentInfo.cvv.length < 3) {
                setError('Please enter a valid CVV');
                return;
            }
        }
        setError('');
        setStep(3);
    };

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            setError('Your cart is empty');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Simulate API call to create order
            await new Promise(resolve => setTimeout(resolve, 2000));

            const newOrderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            setOrderId(newOrderId);

            // Clear cart
            CartService.clearCart();
            window.dispatchEvent(new Event('cartUpdated'));

            setLoading(false);
            setOrderSuccess(true);
            setStep(4);
        } catch (err) {
            setError('Failed to place order. Please try again.');
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <Container className="py-5 text-center">
                <Card className="border-success shadow-lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <Card.Body className="py-5">
                        <div className="display-1 text-success mb-4">
                            <FaCheckCircle />
                        </div>
                        <h1 className="mb-3">Order Successful! 🎉</h1>
                        <p className="lead mb-4">
                            Thank you for your purchase. Your order has been placed successfully.
                        </p>

                        <Card className="mb-4">
                            <Card.Body>
                                <h5>Order Details</h5>
                                <p className="mb-2"><strong>Order ID:</strong> {orderId}</p>
                                <p className="mb-2"><strong>Total Amount:</strong> ${total.toFixed(2)}</p>
                                <p className="mb-0"><strong>Estimated Delivery:</strong> 3-5 business days</p>
                            </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-center gap-3">
                            <Button variant="primary" onClick={() => navigate('/orders')}>
                                View Order Details
                            </Button>
                            <Button variant="outline-primary" onClick={() => navigate('/products')}>
                                Continue Shopping
                            </Button>
                        </div>

                        <div className="mt-4">
                            <small className="text-muted">
                                A confirmation email has been sent to {shippingInfo.email || 'your email'}
                            </small>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Progress Steps */}
            <div className="mb-5">
                <div className="d-flex justify-content-between position-relative">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-circle">1</div>
                        <div className="step-label">Shipping</div>
                    </div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-circle">2</div>
                        <div className="step-label">Payment</div>
                    </div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-circle">3</div>
                        <div className="step-label">Review</div>
                    </div>
                    <div className={`step ${step >= 4 ? 'active' : ''}`}>
                        <div className="step-circle">4</div>
                        <div className="step-label">Confirmation</div>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="danger" className="mb-3">
                    {error}
                </Alert>
            )}

            <Row>
                {/* Left Column - Forms */}
                <Col lg={8} className="mb-4">
                    {step === 1 && (
                        <Card className="mb-4">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">
                                    <FaMapMarkerAlt className="me-2" />
                                    Shipping Information
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleShippingSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Full Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    required
                                                    value={shippingInfo.fullName}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                                                    placeholder="Enter your full name"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Email *</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    required
                                                    value={shippingInfo.email}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                                                    placeholder="Enter your email"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone Number</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            value={shippingInfo.phone}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                            placeholder="Enter your phone number"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Address *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            required
                                            value={shippingInfo.address}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                            placeholder="Enter your address"
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>City *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    required
                                                    value={shippingInfo.city}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                                    placeholder="City"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>State *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    required
                                                    value={shippingInfo.state}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                                                    placeholder="State"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>ZIP Code *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    required
                                                    value={shippingInfo.zipCode}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                                                    placeholder="ZIP Code"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Country</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={shippingInfo.country}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                                            placeholder="Country"
                                        />
                                    </Form.Group>

                                    <div className="d-flex justify-content-end">
                                        <Button type="submit" variant="primary">
                                            Continue to Payment
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card className="mb-4">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">
                                    <FaCreditCard className="me-2" />
                                    Payment Method
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={handlePaymentSubmit}>
                                    <div className="mb-4">
                                        <Form.Check
                                            type="radio"
                                            id="creditCard"
                                            label={
                                                <>
                                                    <FaCreditCard className="me-2" />
                                                    Credit/Debit Card
                                                </>
                                            }
                                            name="paymentMethod"
                                            checked={paymentInfo.method === 'creditCard'}
                                            onChange={() => setPaymentInfo({ ...paymentInfo, method: 'creditCard' })}
                                            className="mb-3"
                                        />

                                        {paymentInfo.method === 'creditCard' && (
                                            <div className="ms-4">
                                                <Row>
                                                    <Col md={12}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Card Number *</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="1234 5678 9012 3456"
                                                                maxLength="19"
                                                                value={paymentInfo.cardNumber}
                                                                onChange={(e) => {
                                                                    let value = e.target.value.replace(/\D/g, '');
                                                                    if (value.length > 16) value = value.substr(0, 16);
                                                                    value = value.replace(/(.{4})/g, '₹1 ').trim();
                                                                    setPaymentInfo({ ...paymentInfo, cardNumber: value });
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Card Holder Name *</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Nikita Gangurde"
                                                                value={paymentInfo.cardName}
                                                                onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={3}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Expiry (MM/YY) *</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="MM/YY"
                                                                value={paymentInfo.expiry}
                                                                onChange={(e) => {
                                                                    let value = e.target.value.replace(/\D/g, '');
                                                                    if (value.length > 4) value = value.substr(0, 4);
                                                                    if (value.length > 2) {
                                                                        value = value.substr(0, 2) + '/' + value.substr(2);
                                                                    }
                                                                    setPaymentInfo({ ...paymentInfo, expiry: value });
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={3}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>CVV *</Form.Label>
                                                            <Form.Control
                                                                type="password"
                                                                placeholder="123"
                                                                maxLength="3"
                                                                value={paymentInfo.cvv}
                                                                onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value.replace(/\D/g, '') })}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </div>
                                        )}

                                        <Form.Check
                                            type="radio"
                                            id="paypal"
                                            label={
                                                <>
                                                    <FaPaypal className="me-2" />
                                                    PayPal
                                                </>
                                            }
                                            name="paymentMethod"
                                            checked={paymentInfo.method === 'paypal'}
                                            onChange={() => setPaymentInfo({ ...paymentInfo, method: 'paypal' })}
                                            className="mb-3"
                                        />

                                        <Form.Check
                                            type="radio"
                                            id="cod"
                                            label={
                                                <>
                                                    <FaMoneyBillWave className="me-2" />
                                                    Cash on Delivery
                                                </>
                                            }
                                            name="paymentMethod"
                                            checked={paymentInfo.method === 'cod'}
                                            onChange={() => setPaymentInfo({ ...paymentInfo, method: 'cod' })}
                                        />
                                    </div>

                                    <Alert variant="info">
                                        <FaLock className="me-2" />
                                        Your payment information is secure and encrypted
                                    </Alert>

                                    <div className="d-flex justify-content-between">
                                        <Button variant="outline-secondary" onClick={() => setStep(1)}>
                                            <FaArrowLeft className="me-1" />
                                            Back to Shipping
                                        </Button>
                                        <Button type="submit" variant="primary">
                                            Review Order
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    )}

                    {step === 3 && (
                        <Card className="mb-4">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">
                                    <FaShoppingBag className="me-2" />
                                    Order Review
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <h6 className="mb-3">Shipping Information</h6>
                                <Card className="mb-4">
                                    <Card.Body>
                                        <p className="mb-1"><strong>{shippingInfo.fullName}</strong></p>
                                        <p className="mb-1">{shippingInfo.address}</p>
                                        <p className="mb-1">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                                        <p className="mb-1">{shippingInfo.country}</p>
                                        <p className="mb-0">Email: {shippingInfo.email}</p>
                                        {shippingInfo.phone && <p className="mb-0">Phone: {shippingInfo.phone}</p>}
                                    </Card.Body>
                                </Card>

                                <h6 className="mb-3">Payment Method</h6>
                                <Card className="mb-4">
                                    <Card.Body>
                                        {paymentInfo.method === 'creditCard' ? (
                                            <div>
                                                <p className="mb-1"><FaCreditCard className="me-2" />Credit/Debit Card</p>
                                                <p className="mb-0">Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
                                            </div>
                                        ) : paymentInfo.method === 'paypal' ? (
                                            <p className="mb-0"><FaPaypal className="me-2" />PayPal</p>
                                        ) : (
                                            <p className="mb-0"><FaMoneyBillWave className="me-2" />Cash on Delivery</p>
                                        )}
                                    </Card.Body>
                                </Card>

                                <h6 className="mb-3">Order Summary</h6>
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.name}</td>
                                                <td>₹{item.price.toFixed(2)}</td>
                                                <td>{item.quantity}</td>
                                                <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                <div className="border-top pt-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Shipping</span>
                                        <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span>Tax</span>
                                        <span>₹{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-2">
                                        <span>Total</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <Form.Check
                                        type="checkbox"
                                        id="terms"
                                        label={
                                            <>
                                                I agree to the <a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Policy</a>
                                            </>
                                        }
                                        className="mb-3"
                                    />

                                    <div className="d-flex justify-content-between">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setStep(2)}
                                        >
                                            <FaArrowLeft className="me-1" />
                                            Back to Payment
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={handlePlaceOrder}
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
                                                    Processing...
                                                </>
                                            ) : (
                                                'Place Order'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </Col>

                {/* Right Column - Order Summary */}
                <Col lg={4}>
                    <Card className="sticky-top" style={{ top: '20px' }}>
                        <Card.Header>
                            <h5 className="mb-0">Order Summary</h5>
                        </Card.Header>
                        <Card.Body>
                            {cartItems.length === 0 ? (
                                <p className="text-center">Your cart is empty</p>
                            ) : (
                                <>
                                    <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {cartItems.map(item => (
                                            <div key={item.id} className="d-flex align-items-center mb-2 pb-2 border-bottom">
                                                <div className="me-2" style={{ width: '40px', height: '40px' }}>
                                                    <img
                                                        src={item.image || 'https://via.placeholder.com/40x40?text=Product'}
                                                        alt={item.name}
                                                        className="img-fluid rounded"
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <small className="d-block">{item.name}</small>
                                                    <small className="text-muted">
                                                        {item.quantity} × ₹{item.price.toFixed(2)}
                                                    </small>
                                                </div>
                                                <div className="text-end">
                                                    <small>₹{(item.price * item.quantity).toFixed(2)}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-top pt-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Subtotal</span>
                                                <span>₹{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Shipping</span>
                                                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-3">
                                            <span>Tax</span>
                                                <span>₹{tax.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-2">
                                            <span>Total</span>
                                                <span>₹{total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <Alert variant="info" className="small mt-3">
                                        <FaTruck className="me-2" />
                                            <strong>Free Shipping</strong> on orders above ₹199
                                    </Alert>

                                    {step === 3 && (
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-100 mt-3"
                                            onClick={handlePlaceOrder}
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
                                                    Processing...
                                                </>
                                            ) : (
                                                'Place Order'
                                            )}
                                        </Button>
                                    )}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Add CSS for steps */}
            <style>
                {`
                .step {
                    text-align: center;
                    position: relative;
                    flex: 1;
                }
                .step-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: #e9ecef;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 10px;
                    font-weight: bold;
                    color: #6c757d;
                    border: 2px solid #e9ecef;
                }
                .step.active .step-circle {
                    background-color: #0d6efd;
                    color: white;
                    border-color: #0d6efd;
                }
                .step-label {
                    font-size: 14px;
                    color: #6c757d;
                }
                .step.active .step-label {
                    color: #0d6efd;
                    font-weight: bold;
                }
                .step:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    top: 20px;
                    left: 60%;
                    width: 80%;
                    height: 2px;
                    background-color: #e9ecef;
                    z-index: -1;
                }
                .step.active:not(:last-child)::after {
                    background-color: #0d6efd;
                }
                `}
            </style>
        </Container>
    );
};

export default Checkout;