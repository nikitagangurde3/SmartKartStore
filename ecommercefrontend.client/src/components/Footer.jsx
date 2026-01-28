// Create: src/components/Footer.jsx
import React from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { 
    FaFacebook, FaTwitter, FaInstagram, FaLinkedin, 
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaHeart,
    FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcApplePay
} from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer bg-dark text-white mt-auto">
            <Container className="py-5">
                <Row>
                    <Col lg={4} md={6} className="mb-4">
                        <h4 className="text-warning mb-3">
                            <span className="text-warning">Smart</span>Kart
                        </h4>
                        <p className="text-light mb-4">
                            Your one-stop destination for all electronics. 
                            We provide the latest smartphones, laptops, tablets, 
                            and accessories at unbeatable prices.
                        </p>
                        <div className="d-flex gap-3">
                            <Button variant="outline-light" size="sm" className="rounded-circle">
                                <FaFacebook />
                            </Button>
                            <Button variant="outline-light" size="sm" className="rounded-circle">
                                <FaTwitter />
                            </Button>
                            <Button variant="outline-light" size="sm" className="rounded-circle">
                                <FaInstagram />
                            </Button>
                            <Button variant="outline-light" size="sm" className="rounded-circle">
                                <FaLinkedin />
                            </Button>
                        </div>
                    </Col>

                    <Col lg={2} md={6} className="mb-4">
                        <h5 className="mb-3">Quick Links</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <a href="/" className="text-light text-decoration-none">
                                    Home
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/products" className="text-light text-decoration-none">
                                    Products
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/compare" className="text-light text-decoration-none">
                                    Compare
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/cart" className="text-light text-decoration-none">
                                    Cart
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="text-light text-decoration-none">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </Col>

                    <Col lg={3} md={6} className="mb-4">
                        <h5 className="mb-3">Contact Us</h5>
                        <ul className="list-unstyled">
                            <li className="mb-3 d-flex align-items-start">
                                <FaMapMarkerAlt className="me-2 mt-1 text-warning" />
                                <span className="text-light">
                                    123 Electronics Street, Jadhavwadi, Chikhali, Pune 12345
                                </span>
                            </li>
                            <li className="mb-3 d-flex align-items-center">
                                <FaPhone className="me-2 text-warning" />
                                <a href="tel:+11234567890" className="text-light text-decoration-none">
                                    +91 123456789
                                </a>
                            </li>
                            <li className="d-flex align-items-center">
                                <FaEnvelope className="me-2 text-warning" />
                                <a href="mailto:support@smartkart.com" className="text-light text-decoration-none">
                                    support@smartkart.com
                                </a>
                            </li>
                        </ul>
                    </Col>

                    <Col lg={3} md={6} className="mb-4">
                        <h5 className="mb-3">Newsletter</h5>
                        <p className="text-light mb-3">
                            Subscribe to get updates on new products and special offers!
                        </p>
                        <Form>
                            <div className="input-group mb-3">
                                <Form.Control 
                                    type="email" 
                                    placeholder="Your email" 
                                    className="border-0"
                                />
                                <Button variant="warning" type="submit">
                                    Subscribe
                                </Button>
                            </div>
                        </Form>
                        <div className="mt-4">
                            <h6 className="mb-2">We Accept</h6>
                            <div className="d-flex gap-2 fs-4">
                                <FaCcVisa className="text-light" />
                                <FaCcMastercard className="text-light" />
                                <FaCcPaypal className="text-light" />
                                <FaCcApplePay className="text-light" />
                            </div>
                        </div>
                    </Col>
                </Row>

                <hr className="border-light my-4" />

                <Row className="align-items-center">
                    <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
                        <p className="mb-0 text-light">
                            &copy; {new Date().getFullYear()} SmartKart. All rights reserved.
                        </p>
                    </Col>
                    <Col md={6} className="text-center text-md-end">
                        <p className="mb-0 text-light">
                           by CDAC Team
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;