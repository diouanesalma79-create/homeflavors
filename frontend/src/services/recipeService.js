import api from './api';

const recipeService = {
    /**
     * Map backend recipe data to match the frontend component expectations.
     * @param {Object} recipe - backend recipe entry
     */
    mapRecipe(recipe) {
        // Handle image URL - The backend Resource already provides a full URL in 'image'
        // If it's missing or a relative path, we can fix it here, but prioritize the backend's 'image' field.
        let image = recipe.image;
        if (!image && recipe.image_url) {
            image = `http://127.0.0.1:8000/storage/${recipe.image_url}`;
        }

        const country = recipe.user ? (recipe.user.nationality || recipe.user.city || 'HomeFlavors') : 'Unknown';
        
        // Map country/nationality to continent for the UI filters
        const continentMap = {
            'Moroccan': 'Africa',
            'Morocco': 'Africa',
            'Japanese': 'Asia',
            'Japan': 'Asia',
            'Chinese': 'Asia',
            'China': 'Asia',
            'Thai': 'Asia',
            'Thailand': 'Asia',
            'Indian': 'Asia',
            'India': 'Asia',
            'Lebanese': 'Asia',
            'Lebanon': 'Asia',
            'Spanish': 'Europe',
            'Spain': 'Europe',
            'Italian': 'Europe',
            'Italy': 'Europe',
            'French': 'Europe',
            'France': 'Europe',
            'Greek': 'Europe',
            'Greece': 'Europe',
            'Turkish': 'Europe',
            'Turkey': 'Europe',
            'Mexican': 'NorthAmerica',
            'Mexico': 'NorthAmerica',
            'American': 'NorthAmerica',
            'USA': 'NorthAmerica',
            'Brazilian': 'SouthAmerica',
            'Brazil': 'SouthAmerica'
        };

        return {
            ...recipe,
            image: image,
            chefName: recipe.user ? recipe.user.name : 'Unknown Chef',
            chefId: recipe.user ? recipe.user.id : null,
            country: country,
            continent: recipe.continent || continentMap[recipe.user?.nationality] || continentMap[country] || 'Other',
            ingredients: Array.isArray(recipe.ingredients) 
                ? recipe.ingredients 
                : (typeof recipe.ingredients === 'string' 
                    ? recipe.ingredients.split(',').map(i => i.trim()) 
                    : []),
        };
    },

    /**
     * Fetch all recipes from the backend with pagination and filters.
     * @param {Object} params - { search, category, city, chef_name, min_price, max_price, page }
     */
    async getAll(params = {}) {
        const response = await api.get('/recipes', { params });
        // response.data.data is the paginated object { data, links, meta }
        const paginatedData = response.data.data;
        return {
            items: paginatedData.data.map(recipe => this.mapRecipe(recipe)),
            meta: paginatedData.meta,
            links: paginatedData.links
        };
    },

    /**
     * Fetch a specific recipe by ID.
     */
    async getOne(id) {
        const response = await api.get(`/recipes/${id}`);
        // For single resources, it's { success, message, data: {...} }
        return this.mapRecipe(response.data.data);
    },

    /**
     * Create a new recipe (Restricted to cooks).
     */
    async create(recipeData) {
        const response = await api.post('/recipes', recipeData);
        return this.mapRecipe(response.data.data);
    },

    /**
     * Update an existing recipe.
     */
    async update(id, recipeData) {
        const response = await api.put(`/recipes/${id}`, recipeData);
        return this.mapRecipe(response.data.data);
    },

    /**
     * Delete a recipe.
     */
    async delete(id) {
        const response = await api.delete(`/recipes/${id}`);
        return response.data;
    },

    /**
     * Fetch recipes for the authenticated cook.
     */
    async getMyRecipes() {
        const response = await api.get('/my-recipes');
        return response.data.data.data.map(this.mapRecipe.bind(this));
    },

    /**
     * Fetch a user's favorite recipes.
     */
    async getFavorites() {
        const response = await api.get('/favorites');
        return response.data.data.data.map(recipe => this.mapRecipe(recipe));
    },

    /**
     * Toggle a recipe as favorite.
     */
    async toggleFavorite(id) {
        const response = await api.post(`/favorites/${id}/toggle`);
        return response.data;
    }
};

export default recipeService;
