import api from './api';

const profileService = {
    /**
     * Update the current user's profile information.
     * @param {Object} profileData - {name, phone, address, profile_picture}
     */
    async updateProfile(profileData) {
        const response = await api.post('/profile', profileData);
        return response.data.data;
    },

    /**
     * Fetch a chef's public profile and recipes.
     * @param {number} chefId
     */
    async getChefProfile(chefId) {
        const response = await api.get(`/chefs/${chefId}`);
        return response.data.data;
    },

    /**
     * List all active chefs.
     */
    async getChefs(params = {}) {
        const response = await api.get('/chefs', { params });
        return response.data.data;
    },

    /**
     * Fetch recipes for a specific chef.
     * @param {number} chefId
     */
    async getChefRecipes(chefId) {
        const response = await api.get(`/chefs/${chefId}/recipes`);
        return response.data.data;
    }
};

export default profileService;
