// src/components/ErrorBoundary.jsx
import React, { Component } from 'react';
import { Alert, Button, Container } from 'react-bootstrap';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Container className="py-5 text-center">
                    <Alert variant="danger" className="shadow-lg">
                        <Alert.Heading>Something went wrong!</Alert.Heading>
                        <p className="mb-3">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>

                        {this.props.showDetails && this.state.errorInfo && (
                            <details className="mb-3">
                                <summary>Error Details</summary>
                                <pre className="text-start mt-2 p-3 bg-dark text-light rounded">
                                    {this.state.error?.toString()}
                                    <br />
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="d-flex justify-content-center gap-2">
                            <Button variant="primary" onClick={this.handleReset}>
                                Try Again
                            </Button>
                            <Button variant="outline-primary" onClick={this.handleReload}>
                                Reload Page
                            </Button>
                        </div>
                    </Alert>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;