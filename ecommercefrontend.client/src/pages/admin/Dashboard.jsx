import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import {
    FaUsers, FaBox, FaShoppingCart, FaDollarSign,
    FaChartLine, FaCog, FaEdit, FaTrash, FaEye,
    FaArrowUp, FaArrowDown, FaCalendarAlt, FaExclamationTriangle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 42,
        totalProducts: 156,
        totalOrders: 289,
        totalRevenue: 125450.75
    });
    const [recentOrders, setRecentOrders] = useState([
        {
            id: 1,
            userName: 'John Doe',
            orderDate: new Date().toISOString(),
            totalAmount: 999.99,
            status: 'Processing'
        },
        {
            id: 2,
            userName: 'Jane Smith',
            orderDate: new Date().toISOString(),
            totalAmount: 1499.99,
            status: 'Delivered'
        },
        {
            id: 3,
            userName: 'Bob Johnson',
            orderDate: new Date().toISOString(),
            totalAmount: 799.99,
            status: 'Pending'
        }
    ]);
    const [topProducts, setTopProducts] = useState([
        { id: 1, name: 'iPhone 15 Pro', sales: 145, revenue: 144855 },
        { id: 2, name: 'MacBook Pro 16"', sales: 89, revenue: 222111 },
        { id: 3, name: 'Samsung Galaxy S24', sales: 120, revenue: 143880 },
        { id: 4, name: 'Dell XPS 15', sales: 67, revenue: 133933 },
        { id: 5, name: 'iPad Pro 12.9"', sales: 95, revenue: 104405 }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [apiAvailable, setApiAvailable] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        // Try to fetch real data, but fallback to mock if API fails
        checkApiAndFetchData();
    }, []);

    const checkApiAndFetchData = async () => {
        setLoading(true);
        setError('');

        try {
            console.log('Checking API availability...');

            // First check if we can reach the API at all
            const testResponse = await api.get('/products?limit=1');
            console.log('API test successful:', testResponse.status);

            // If API works, try to get real admin data
            try {
                const statsResponse = await api.get('/admin/dashboard-stats');
                setStats(statsResponse.data);
                setApiAvailable(true);
                console.log('Real admin data loaded');
            } catch (adminError) {
                console.log('Admin API unavailable, using mock data');
                setApiAvailable(false);
                // Keep using mock data set in initialState
            }

            try {
                const ordersResponse = await api.get('/admin/orders?limit=5');
                setRecentOrders(ordersResponse.data);
            } catch (ordersError) {
                console.log('Orders API unavailable, using mock data');
                // Keep using mock data
            }

        } catch (apiError) {
            console.log('API completely unavailable, using mock data only');
            setApiAvailable(false);
            setError('Backend API is not available. Showing demo data.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading Admin Dashboard...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-2">Admin Dashboard</h1>
                    <p className="text-muted">Welcome back, {user?.name || 'Administrator'}</p>
                    <div className="d-flex align-items-center gap-2">
                        <Badge bg={user?.role === 'Admin' ? 'success' : 'warning'}>
                            {user?.role || 'Unknown'}
                        </Badge>
                        {!apiAvailable && (
                            <Badge bg="info" className="d-flex align-items-center">
                                <FaExclamationTriangle className="me-1" size={12} />
                                Demo Mode
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                        <FaCalendarAlt className="me-2" />
                        Today: {new Date().toLocaleDateString()}
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="warning" className="mb-4">
                    <Alert.Heading className="d-flex align-items-center">
                        <FaExclamationTriangle className="me-2" />
                        {error}
                    </Alert.Heading>
                    <p>You can still use the dashboard with demo data.</p>
                    <div className="d-flex gap-2">
                        <Button variant="outline-warning" size="sm" onClick={checkApiAndFetchData}>
                            Retry Connection
                        </Button>
                        <Button variant="outline-primary" size="sm" onClick={() => navigate('/')}>
                            Go to Home
                        </Button>
                    </div>
                </Alert>
            )}

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col xl={3} lg={6} md={6} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-2">Total Users</h6>
                                    <h2 className="mb-0">{stats.totalUsers || 42}</h2>
                                    <small className="text-success">
                                        <FaArrowUp className="me-1" />
                                        12% from last month
                                    </small>
                                </div>
                                <div className="bg-primary text-white rounded-circle p-3">
                                    <FaUsers size={24} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={3} lg={6} md={6} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-2">Total Products</h6>
                                    <h2 className="mb-0">{stats.totalProducts || 156}</h2>
                                    <small className="text-success">
                                        <FaArrowUp className="me-1" />
                                        8 new this week
                                    </small>
                                </div>
                                <div className="bg-success text-white rounded-circle p-3">
                                    <FaBox size={24} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={3} lg={6} md={6} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-2">Total Orders</h6>
                                    <h2 className="mb-0">{stats.totalOrders || 289}</h2>
                                    <small className="text-success">
                                        <FaArrowUp className="me-1" />
                                        24% from last month
                                    </small>
                                </div>
                                <div className="bg-warning text-white rounded-circle p-3">
                                    <FaShoppingCart size={24} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={3} lg={6} md={6} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-2">Total Revenue</h6>
                                    <h2 className="mb-0">{formatCurrency(stats.totalRevenue || 125450.75)}</h2>
                                    <small className="text-success">
                                        <FaArrowUp className="me-1" />
                                        Rs.12,450 this month
                                    </small>
                                </div>
                                <div className="bg-info text-white rounded-circle p-3">
                                    <FaDollarSign size={24} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                {/* Recent Orders */}
                <Col lg={8} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Recent Orders</h5>
                                <Button variant="link" size="sm" onClick={() => navigate('/admin/orders')}>
                                    View All
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>{order.userName}</td>
                                            <td>{formatDate(order.orderDate)}</td>
                                            <td>{formatCurrency(order.totalAmount)}</td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        order.status === 'Delivered' ? 'success' :
                                                            order.status === 'Processing' ? 'primary' :
                                                                order.status === 'Pending' ? 'warning' :
                                                                    order.status === 'Cancelled' ? 'danger' : 'secondary'
                                                    }
                                                >
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button variant="outline-primary" size="sm">
                                                    <FaEye />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Top Products */}
                <Col lg={4} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Top Products</h5>
                                <Button variant="link" size="sm" onClick={() => navigate('/admin/products')}>
                                    View All
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {topProducts.map((product, index) => (
                                <div key={product.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                                    <div className="bg-light rounded-circle p-2 me-3">
                                        <span className="fw-bold">{index + 1}</span>
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1">{product.name}</h6>
                                        <small className="text-muted">
                                            {product.sales} sales • {formatCurrency(product.revenue)}
                                        </small>
                                    </div>
                                    <div className="text-success">
                                        <FaChartLine />
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light">
                    <h5 className="mb-0">Quick Actions</h5>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={3}>
                            <Button
                                variant="outline-primary"
                                className="w-100 py-3"
                                onClick={() => navigate('/admin/products/new')}
                                disabled={!apiAvailable}
                            >
                                <FaBox className="mb-2" size={24} />
                                <div>Add Product</div>
                            </Button>
                        </Col>
                        <Col md={3}>
                            <Button
                                variant="outline-success"
                                className="w-100 py-3"
                                onClick={() => navigate('/admin/users')}
                                disabled={!apiAvailable}
                            >
                                <FaUsers className="mb-2" size={24} />
                                <div>Manage Users</div>
                            </Button>
                        </Col>
                        <Col md={3}>
                            <Button
                                variant="outline-warning"
                                className="w-100 py-3"
                                onClick={() => navigate('/admin/orders')}
                                disabled={!apiAvailable}
                            >
                                <FaShoppingCart className="mb-2" size={24} />
                                <div>View Orders</div>
                            </Button>
                        </Col>
                        <Col md={3}>
                            <Button
                                variant="outline-info"
                                className="w-100 py-3"
                                onClick={() => navigate('/admin/settings')}
                                disabled={!apiAvailable}
                            >
                                <FaCog className="mb-2" size={24} />
                                <div>Settings</div>
                            </Button>
                        </Col>
                    </Row>
                    {!apiAvailable && (
                        <Alert variant="info" className="mt-3 mb-0">
                            <small>Admin actions are disabled in demo mode. Connect to backend to enable.</small>
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminDashboard;