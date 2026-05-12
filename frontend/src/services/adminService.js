import api from './api';

const adminService = {
  /**
   * Get all pending recipes (admin only).
   */
  async getPendingRecipes() {
    const response = await api.get('/admin/recipes/pending');
    // Response shape: { success, data: { data: [...], meta, links } }
    const payload = response.data.data;
    const items = Array.isArray(payload) ? payload : (payload?.data ?? []);
    return items;
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
};

export default adminService;
