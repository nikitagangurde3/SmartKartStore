//// src/services/api.js
//import axios from 'axios';

//const API_BASE_URL = '/api';

//const api = axios.create({
//    baseURL: API_BASE_URL,
//    headers: {
//        'Content-Type': 'application/json',
//    },
//    timeout: 10000, // 10 second timeout
//});

//// Add token to requests
//api.interceptors.request.use(
//    (config) => {
//        const token = localStorage.getItem('token');
//        if (token) {
//            config.headers.Authorization = `Bearer ${token}`;
//        }
//        return config;
//    },
//    (error) => {
//        return Promise.reject(error);
//    }
//);

//// Response interceptor to handle common errors
//api.interceptors.response.use(
//    (response) => {
//        // Ensure response.data exists
//        return response;
//    },
//    (error) => {
//        console.error('API Error:', error);

//        if (error.response) {
//            // Server responded with error status
//            console.error('Error Response:', error.response.data);

//            if (error.response.status === 401) {
//                // Unauthorized - clear token and redirect
//                localStorage.removeItem('token');
//                localStorage.removeItem('user');
//                window.location.href = '/login';
//            }
//        } else if (error.request) {
//            // Request made but no response
//            console.error('No response received:', error.request);
//        } else {
//            // Something else happened
//            console.error('Error:', error.message);
//        }

//        return Promise.reject(error);
//    }
//);

//export default api;

// api.js - Update the interceptor
import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle token expiration - DON'T auto-redirect
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.status, error.message);

        // Log error but don't redirect
        if (error.response?.status === 401) {
            console.log('Unauthorized - Token may be expired or invalid');
        } else if (error.response?.status === 403) {
            console.log('Forbidden - User does not have required permissions');
        }

        // Just reject the promise - let components handle the error
        return Promise.reject(error);
    }
);

export default api;