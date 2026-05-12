// Utility to handle recipe ID mapping between different data sources
// This resolves conflicts between recipes.json and enhancedRecipes.json

// Mapping table to convert recipes.json IDs to enhancedRecipes.json IDs
// Format: { originalId: enhancedId }
const recipeIdMap = {
  // Original recipes.json -> enhancedRecipes.json mapping
  1: 13,   // Moroccan Tagine -> Tagine of Lamb
  2: 16,   // Japanese Ramen -> Ramen
  3: 10,   // Italian Pasta Carbonara -> Risotto alla Milanese
  4: null, // American Burger (not in enhancedRecipes)
  5: null, // Mexican Tacos (not in enhancedRecipes)  
  6: null, // Indian Butter Chicken (not in enhancedRecipes)
  7: null, // French Ratatouille (not in enhancedRecipes)
  8: null, // Chinese Dumplings (not in enhancedRecipes)
  9: 7,    // Pad Thai -> Pho (closest match, though not exact)
  10: 11,   // Moussaka -> Osso Buco (both are casseroles, but from different cuisines)
  11: null, // Jollof Rice (not in enhancedRecipes)
  12: null  // Brazilian Feijoada (not in enhancedRecipes)
};

// Reverse mapping for enhancedRecipes.json -> recipes.json
const enhancedToOriginalMap = Object.fromEntries(
  Object.entries(recipeIdMap)
    .filter(([_, enhancedId]) => enhancedId !== null)
    .map(([originalId, enhancedId]) => [enhancedId, parseInt(originalId)])
);

/**
 * Convert original recipe ID to enhanced recipe ID
 * @param {number} originalId - ID from recipes.json
 * @returns {number|null} - Corresponding ID from enhancedRecipes.json, or null if no match
 */
export const mapToEnhancedId = (originalId) => {
  return recipeIdMap[originalId] || null;
};

/**
 * Convert enhanced recipe ID to original recipe ID  
 * @param {number} enhancedId - ID from enhancedRecipes.json
 * @returns {number|null} - Corresponding ID from recipes.json, or null if no match
 */
export const mapToOriginalId = (enhancedId) => {
  return enhancedToOriginalMap[enhancedId] || null;
};

/**
 * Get the correct recipe data based on the ID and source
 * @param {number} id - The recipe ID from URL params
 * @param {Array} enhancedRecipes - enhancedRecipes.json data
 * @param {Array} originalRecipes - recipes.json data
 * @returns {Object|null} - The matched recipe object
 */
export const getRecipeById = (id, enhancedRecipes, originalRecipes) => {
  // First, try to find in enhancedRecipes
  let recipe = enhancedRecipes.find(r => r.id === parseInt(id));
  
  if (recipe) {
    return recipe;
  }
  
  // If not found, check if this is an original recipe ID that maps to enhanced
  const enhancedId = mapToEnhancedId(parseInt(id));
  if (enhancedId) {
    recipe = enhancedRecipes.find(r => r.id === enhancedId);
    if (recipe) {
      return recipe;
    }
  }
  
  // Finally, fall back to original recipes
  recipe = originalRecipes.find(r => r.id === parseInt(id));
  if (recipe) {
    // Add default values for missing fields to match enhanced recipe structure
    return {
      ...recipe,
      country: recipe.continent || 'Unknown',
      chefId: null,
      chefName: 'Unknown Chef'
    };
  }
  
  return null;
};

export default {
  mapToEnhancedId,
  mapToOriginalId,
  getRecipeById
};