// Utility functions for location detection and region-based restrictions

/**
 * Simulates getting user's location
 * In a real application, this would use the browser's geolocation API
 * or get the location from user preferences/settings
 * @returns {Promise<string>} Promise that resolves to the user's country
 */
export const getUserLocation = async () => {
  // Simulate async operation (in real app, this might be geolocation API call)
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would be determined by actual geolocation or user setting
      // For demo purposes, we'll return a default location
      resolve('Spain'); // This can be changed to simulate different locations
    }, 100);
  });
};

/**
 * Checks if a recipe can be ordered based on user's location
 * @param {string} userLocation - The user's current location/country
 * @param {string} recipeLocation - The location/country where the recipe is available
 * @returns {boolean} True if the recipe can be ordered from the user's location
 */
export const canOrderRecipe = (userLocation, recipeLocation) => {
  if (!userLocation || !recipeLocation) {
    return false;
  }
  
  // For this implementation, we only allow ordering if user is in the same country as the chef
  return userLocation.toLowerCase() === recipeLocation.toLowerCase();
};

/**
 * Gets a list of countries where ordering is available
 * @returns {Array<string>} List of available countries
 */
export const getAvailableCountries = () => {
  // This would typically come from a configuration or API
  return ['Spain', 'Egypt', 'Vietnam', 'Italy', 'Morocco', 'Japan'];
};