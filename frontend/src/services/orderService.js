import api from './api';

const orderService = {
    /**
     * Fetch the current user's purchase history.
     */
    async getUserOrders() {
        const response = await api.get('/my-orders');
        // Standard response: { success, data: { data: [], meta, links } }
        return response.data.data.data;
    },

    /**
     * Place an order for a recipe dish from a chef's profile.
     * Requires authentication (customer token).
     * @param {Object} orderData
     */
    async placeOrder(orderData) {
        const response = await api.post('/orders', orderData);
        return response.data.data;
    },

    async getIncomingOrders() {
        const response = await api.get('/incoming-orders');
        return response.data.data.data;
    },

    async updateStatus(id, status) {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data.data;
    }
};

export default orderService;
