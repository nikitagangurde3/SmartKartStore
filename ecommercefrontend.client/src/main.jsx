// main.jsx - Fixed version with UI cleanup functions
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './index.css';

// Global UI cleanup function
const cleanupUI = () => {
    // Remove all Bootstrap modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
        if (backdrop && backdrop.parentNode) {
            backdrop.parentNode.removeChild(backdrop);
        }
    });

    // Remove modal-open class from body
    document.body.classList.remove('modal-open');

    // Reset body styles
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0';
    document.body.style.position = 'static';

    // Remove any leftover modals
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    });

    // Enable pointer events globally
    document.body.style.pointerEvents = 'auto';

    // Remove any inline styles that might block interactions
    const blockedElements = document.querySelectorAll('[style*="pointer-events: none"]');
    blockedElements.forEach(el => {
        if (!el.classList.contains('modal') && !el.classList.contains('modal-backdrop')) {
            el.style.pointerEvents = 'auto';
        }
    });

    // Force remove any fade overlays
    const fades = document.querySelectorAll('.fade');
    fades.forEach(fade => {
        if (fade.classList.contains('modal-backdrop') || fade.classList.contains('modal')) {
            fade.style.display = 'none';
        }
    });
};

// Global click fix for Bootstrap modal issues
const fixBootstrapModalIssues = () => {
    // Clean up on initial load
    cleanupUI();

    // Fix for Bootstrap event listeners
    const originalShowFn = bootstrap.Modal.prototype.show;
    bootstrap.Modal.prototype.show = function () {
        // Clean up before showing new modal
        cleanupUI();
        return originalShowFn.apply(this, arguments);
    };

    const originalHideFn = bootstrap.Modal.prototype.hide;
    bootstrap.Modal.prototype.hide = function () {
        const result = originalHideFn.apply(this, arguments);
        // Clean up after hiding modal
        setTimeout(cleanupUI, 150);
        return result;
    };

    // Listen for route changes
    let lastUrl = window.location.href;
    new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            // Clean up on route change
            setTimeout(cleanupUI, 100);
        }
    }).observe(document, { subtree: true, childList: true });

    // Listen for auth changes (login/logout)
    window.addEventListener('authChange', () => {
        setTimeout(cleanupUI, 100);
    });

    // Listen for storage changes (token/user changes)
    window.addEventListener('storage', (e) => {
        if (e.key === 'token' || e.key === 'user') {
            setTimeout(cleanupUI, 100);
        }
    });

    // Fix for Escape key closing modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            setTimeout(cleanupUI, 150);
        }
    });

    // Fix for clicks outside modals
    document.addEventListener('click', (e) => {
        // If clicking on modal backdrop
        if (e.target.classList.contains('modal-backdrop')) {
            setTimeout(cleanupUI, 150);
        }
    }, true);
};

// Suppress React warnings that aren't critical
const originalError = console.error;
const originalWarn = console.warn;

console.error = function (...args) {
    if (typeof args[0] === 'string') {
        // Suppress specific warnings
        const suppressedMessages = [
            'Warning: %s',
            'Warning: Cannot update a component',
            'Warning: Did not expect server HTML',
            'Warning: Invalid DOM property',
            'validateDOMNesting',
            'React does not recognize',
            'unique "key" prop'
        ];

        const shouldSuppress = suppressedMessages.some(msg => args[0].includes(msg));
        if (shouldSuppress) {
            return;
        }
    }
    originalError.apply(console, args);
};

console.warn = function (...args) {
    if (typeof args[0] === 'string') {
        // Suppress Bootstrap transition warnings
        const suppressedWarnings = [
            'ReactDOM.render is no longer supported',
            'Please update the following components',
            'Bootstrap\'s modal',
            'transition'
        ];

        const shouldSuppress = suppressedWarnings.some(msg => args[0].includes(msg));
        if (shouldSuppress) {
            return;
        }
    }
    originalWarn.apply(console, args);
};

// Initialize the app
const initializeApp = () => {
    try {
        // Clean up any existing UI issues
        cleanupUI();

        // Create root
        const rootElement = document.getElementById('root');
        if (!rootElement) {
            throw new Error('Root element not found');
        }

        const root = ReactDOM.createRoot(rootElement);

        // Render app
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );

        // Apply Bootstrap fixes after render
        setTimeout(() => {
            if (typeof bootstrap !== 'undefined') {
                fixBootstrapModalIssues();
            }

            // Additional cleanup after React hydration
            setTimeout(cleanupUI, 500);

            // Periodic cleanup (in case of memory leaks)
            setInterval(cleanupUI, 30000); // Every 30 seconds
        }, 1000);

        // Export cleanup function for use in components
        window.__cleanupUI = cleanupUI;

        console.log('✅ App initialized successfully');

    } catch (error) {
        console.error('❌ Failed to initialize app:', error);

        // Show error to user
        const rootElement = document.getElementById('root');
        if (rootElement) {
            rootElement.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; margin: 20px;">
                    <h2>Application Error</h2>
                    <p>Failed to load the application. Please try refreshing the page.</p>
                    <p><small>${error.message}</small></p>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #0d6efd; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);

    // Don't show UI errors for known issues
    const knownErrors = [
        'ResizeObserver',
        'undefined bootstrap',
        'undefined jQuery'
    ];

    if (!knownErrors.some(err => event.error?.message?.includes(err))) {
        // Clean up UI on error
        cleanupUI();
    }

    // Prevent default error handling for specific cases
    if (event.error?.message?.includes('Bootstrap')) {
        event.preventDefault();
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);

    // Clean up UI on promise rejection
    setTimeout(cleanupUI, 100);
});

// Export for debugging
if (process.env.NODE_ENV === 'development') {
    window.cleanupUI = cleanupUI;
    console.log('🚀 Development mode: UI cleanup function available at window.cleanupUI()');
}

// Hot Module Replacement (HMR) support
if (import.meta.hot) {
    import.meta.hot.accept();

    import.meta.hot.dispose(() => {
        // Clean up before hot reload
        cleanupUI();
        console.log('🔄 Hot reload cleanup');
    });
}