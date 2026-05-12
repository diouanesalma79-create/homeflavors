import api from './api';

const dashboardService = {
    /**
     * Fetch all chef dashboard stats in a single call.
     * Returns: totalRecipes, pendingOrders, unreadMessages,
     *          averageRating, recentRecipes, recentMessages, recentActivity
     */
    async getChefStats() {
        const response = await api.get('/chef/stats');
        return response.data.data;
    },
};

export default dashboardService;
