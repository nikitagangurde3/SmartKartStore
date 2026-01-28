import React, { useState } from 'react';
import { Card, Button, Badge, Toast } from 'react-bootstrap';
import { FaShoppingCart, FaHeart, FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import CartService from '../services/cartService';

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
    const [showToast, setShowToast] = useState(false);
    const [isInCart, setIsInCart] = useState(CartService.isInCart(product.id));

    const handleAddToCart = () => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to add items to cart!');
            return;
        }

        // Add to cart
        CartService.addToCart(product, 1);
        setIsInCart(true);

        // Show success toast
        setShowToast(true);

        // Call parent callback if provided
        if (onAddToCart) {
            onAddToCart(product.id);
        }

        // Update cart count in navbar
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleAddToWishlist = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to add items to wishlist!');
            return;
        }

        if (onAddToWishlist) {
            onAddToWishlist(product.id);
        }
    };

    return (
        <>
            <Card className="h-100 product-card">
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Card.Img
                        variant="top"
                        src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=Product+Image'}
                        className="product-image"
                        alt={product.name}
                    />
                </Link>
                <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                        <Badge bg="secondary" className="me-1">
                            {product.brand}
                        </Badge>
                        {product.stock < 10 && product.stock > 0 && (
                            <Badge bg="warning" text="dark">
                                Only {product.stock} left
                            </Badge>
                        )}
                    </div>
                    <Card.Title className="mb-2" style={{ fontSize: '1rem', height: '3rem' }}>
                        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {product.name}
                        </Link>
                    </Card.Title>
                    <Card.Text className="text-muted small flex-grow-1" style={{ height: '3rem' }}>
                        {product.description?.substring(0, 80) || 'No description available'}...
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                        <span className="h5 text-primary mb-0">
                            ${product.price?.toFixed(2) || '0.00'}
                        </span>
                        <div>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="me-2 rounded-circle"
                                style={{ width: '36px', height: '36px' }}
                                onClick={handleAddToWishlist}
                                disabled={!localStorage.getItem('token')}
                                title={!localStorage.getItem('token') ? "Login to add to wishlist" : "Add to wishlist"}
                            >
                                <FaHeart />
                            </Button>
                            <Button
                                variant={isInCart ? "success" : "primary"}
                                size="sm"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || (!localStorage.getItem('token') && !isInCart)}
                                title={!localStorage.getItem('token') ? "Login to add to cart" :
                                    product.stock === 0 ? "Out of stock" :
                                        isInCart ? "Already in cart" : "Add to cart"}
                            >
                                {isInCart ? <FaCheck /> : <FaShoppingCart className="me-1" />}
                                {isInCart ? 'Added' : product.stock === 0 ? 'Out of Stock' : 'Add'}
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Success Toast */}
            <Toast
                show={showToast}
                onClose={() => setShowToast(false)}
                delay={3000}
                autohide
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 9999
                }}
            >
                <Toast.Header closeButton>
                    <strong className="me-auto text-success">
                        <FaShoppingCart className="me-2" />
                        Added to Cart!
                    </strong>
                </Toast.Header>
                <Toast.Body>
                    <strong>{product.name}</strong> has been added to your cart.
                    <div className="mt-2">
                        <Button
                            variant="outline-primary"
                            size="sm"
                            as={Link}
                            to="/cart"
                            onClick={() => setShowToast(false)}
                        >
                            View Cart
                        </Button>
                    </div>
                </Toast.Body>
            </Toast>
        </>
    );
};

export default ProductCard;