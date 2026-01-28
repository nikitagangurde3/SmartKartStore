import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';
import {
    FaHome, FaBox, FaUsers, FaShoppingCart,
    FaChartLine, FaCog, FaSignOutAlt, FaBars,
    FaTachometerAlt
} from 'react-icons/fa';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = () => {
    const [showSidebar, setShowSidebar] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        console.log('AdminLayout: Checking authentication');
        console.log('Token:', token);
        console.log('User:', user);

        if (!token) {
            alert('Please login to access admin panel');
            navigate('/login');
            return;
        }

        const userRole = user?.role?.toLowerCase();
        if (userRole !== 'admin') {
            alert('Access denied. Admin privileges required.');
            navigate('/');
            return;
        }

        console.log('AdminLayout: Authentication successful');
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: '/admin/products', label: 'Products', icon: <FaBox /> },
        { path: '/admin/users', label: 'Users', icon: <FaUsers /> },
        { path: '/admin/orders', label: 'Orders', icon: <FaShoppingCart /> },
        { path: '/admin/analytics', label: 'Analytics', icon: <FaChartLine /> },
        { path: '/admin/settings', label: 'Settings', icon: <FaCog /> },
    ];

    return (
        <div className="admin-layout">
            {/* Top Navbar */}
            <Navbar bg="dark" variant="dark" expand="lg" className="admin-navbar">
                <Container fluid>
                    <Button
                        variant="outline-light"
                        onClick={() => setShowSidebar(true)}
                        className="me-3"
                    >
                        <FaBars />
                    </Button>

                    <Navbar.Brand as={Link} to="/admin/dashboard" className="fw-bold">
                        <span className="text-warning">Smart</span>Kart Admin
                    </Navbar.Brand>

                    <Nav className="ms-auto">
                        <Button
                            variant="outline-light"
                            as={Link}
                            to="/"
                            size="sm"
                            className="me-2"
                        >
                            <FaHome className="me-1" />
                            View Store
                        </Button>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt className="me-1" />
                            Logout
                        </Button>
                    </Nav>
                </Container>
            </Navbar>

            {/* Sidebar Offcanvas */}
            <Offcanvas
                show={showSidebar}
                onHide={() => setShowSidebar(false)}
                placement="start"
                className="admin-sidebar"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="fw-bold">
                        Admin Panel
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <Nav className="flex-column">
                        {menuItems.map((item) => (
                            <Nav.Link
                                key={item.path}
                                as={Link}
                                to={item.path}
                                className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => setShowSidebar(false)}
                            >
                                <span className="admin-nav-icon">{item.icon}</span>
                                {item.label}
                            </Nav.Link>
                        ))}
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content */}
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;