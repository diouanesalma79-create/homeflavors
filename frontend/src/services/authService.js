import api from './api';

const authService = {
    /**
     * Register a new user.
     * @param {Object} userData - {name, email, password, password_confirmation, role}
     */
    async register(userData) {
        const response = await api.post('/register', userData);
        const { data } = response.data; // This is { access_token, user, ... }
        if (data.access_token) {
            localStorage.setItem('auth_token', data.access_token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        return data;
    },

    async login({ email, password }) {
        const response = await api.post('/login', { email, password });
        const { data } = response.data;
        if (data.access_token) {
            localStorage.setItem('auth_token', data.access_token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        return data;
    },

    async logout() {
        try {
            await api.post('/logout');
        } catch (err) {
            console.error('Logout error on backend:', err);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('currentUser');
            delete api.defaults.headers.common['Authorization'];
        }
    },

    async getMe() {
        const response = await api.get('/me');
        return response.data.data;
    },

    /**
     * Check if user is logged in.
     */
    isLoggedIn() {
        return !!localStorage.getItem('auth_token');
    },

    /**
     * Get the current user from localStorage.
     */
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        if (!user || user === 'undefined') return null;
        try {
            return JSON.parse(user);
        } catch (err) {
            console.error('Error parsing user:', err);
            return null;
        }
    },

    /**
     * Update the current user in localStorage.
     */
    updateCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
};

export default authService;
