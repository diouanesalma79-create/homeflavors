import api from './api';

const collectionFromResponse = (response) => {
  const payload = response.data.data;
  return Array.isArray(payload) ? payload : (payload?.data ?? []);
};

const adminService = {
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data.data;
  },

  /**
   * Get all pending recipes (admin only).
   */
  async getPendingRecipes() {
    const response = await api.get('/admin/recipes/pending');
    return collectionFromResponse(response);
  },

  /**
   * Approve a recipe (admin only).
   */
  async approveRecipe(recipeId) {
    const response = await api.patch(`/admin/recipes/${recipeId}/approve`);
    return response.data.data;
  },

  /**
   * Reject a recipe (admin only).
   */
  async rejectRecipe(recipeId) {
    const response = await api.patch(`/admin/recipes/${recipeId}/reject`);
    return response.data.data;
  },

  async getPendingChefs() {
    const response = await api.get('/admin/chefs/pending');
    return collectionFromResponse(response);
  },

  async approveChef(userId) {
    const response = await api.patch(`/admin/chefs/${userId}/approve`);
    return response.data.data;
  },

  async rejectChef(userId) {
    const response = await api.patch(`/admin/chefs/${userId}/reject`);
    return response.data.data;
  },

  async searchUsers(query) {
    const response = await api.get('/users/search', { params: { q: query } });
    return response.data.data || [];
  },

  async getOrders() {
    const response = await api.get('/admin/orders');
    return collectionFromResponse(response);
  },

  async updateOrderStatus(orderId, status) {
    const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
    return response.data.data;
  },

  async banUser(userId) {
    const response = await api.patch(`/admin/users/${userId}/ban`);
    return response.data.data;
  },

  async unbanUser(userId) {
    const response = await api.patch(`/admin/users/${userId}/unban`);
    return response.data.data;
  },
};

export default adminService;
