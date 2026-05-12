import api from './api';
import recipeService from './recipeService';

const chefService = {
    /**
     * Map backend user (cook) data to match the frontend expectations in chefsData.js.
     * @param {Object} chef - backend user entry
     */
    mapChef(chef) {
        return {
            ...chef,
            image: chef.profile_picture, // Map profile_picture to image for the UI
            country: chef.address, // Optional mapping, if country is stored in address
            // Any other mappings to keep compatibility with chefsData.js
        };
    },

    /**
     * Fetch a list of all cooks/chefs.
     */
    async getChefs() {
        const response = await api.get('/chefs');
        return response.data.data.map(this.mapChef);
    },

    /**
     * Fetch detailed profile of a cook, including their recipes.
     */
    async getChefDetails(id) {
        const response = await api.get(`/chefs/${id}`);
        const { profile, recipes } = response.data;
        
        return {
            profile: this.mapChef(profile),
            recipes: recipes.map(recipeService.mapRecipe)
        };
    }
};

export default chefService;
