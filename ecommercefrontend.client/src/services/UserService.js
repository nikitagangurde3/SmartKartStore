// Create: src/services/UserService.js
import api from './api';

class UserService {
    static async getProfile() {
        try {
            const response = await api.get('/users/profile');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            throw error;
        }
    }

    static async updateProfile(userData) {
        try {
            const response = await api.put('/users/profile', userData);
            return response.data;
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    }

    static async changePassword(oldPassword, newPassword) {
        try {
            const response = await api.post('/users/change-password', {
                oldPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            console.error('Failed to change password:', error);
            throw error;
        }
    }

    static async getOrders() {
        try {
            const response = await api.get('/orders/myorders');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            throw error;
        }
    }
}

export default UserService;