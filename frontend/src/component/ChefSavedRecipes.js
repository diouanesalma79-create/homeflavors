import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import recipeService from '../services/recipeService';
import authService from '../services/authService';
import LoadingSpinner from './common/LoadingSpinner';
import '../style/ChefRecipes.css'; // Reusing styles for consistency

const ChefSavedRecipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        setLoading(true);
        const user = await authService.getMe();
        if (user.role !== 'cook' && user.role !== 'chef') {
            navigate('/recipes');
            return;
        }

        const data = await recipeService.getFavorites();
        setRecipes(data || []);
      } catch (err) {
        console.error('Error fetching saved recipes:', err);
        setError('Failed to load your saved recipes.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, [navigate]);

  const handleRemoveFavorite = async (recipeId) => {
    if (window.confirm('Are you sure you want to remove this recipe from your favorites?')) {
      try {
        await recipeService.toggleFavorite(recipeId);
        setRecipes(recipes.filter(r => r.id !== recipeId));
      } catch (err) {
        alert('Failed to remove recipe.');
      }
    }
  };

  if (loading) return <LoadingSpinner message="Opening your collection..." />;

  return (
    <div className="chef-recipes-page">
      <div className="recipes-header">
        <h2>Saved Recipes</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      {recipes.length === 0 ? (
        <div className="empty-state">
          <p>You haven't saved any recipes yet.</p>
          <button className="add-first-recipe-btn" onClick={() => navigate('/recipes')}>
            Explore Recipes
          </button>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <img src={recipe.image || '/placeholder-recipe.jpg'} alt={recipe.title} className="recipe-image" />
              <div className="recipe-info">
                <h3 className="recipe-title">{recipe.title}</h3>
                <p className="recipe-description">{recipe.description?.substring(0, 80)}...</p>
                <div className="recipe-stats">
                   <span className="chef-tag">By {recipe.chefName}</span>
                </div>
              </div>
              <div className="recipe-actions">
                <button 
                  className="view-recipe-btn" 
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                >
                  View Recipe
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => handleRemoveFavorite(recipe.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChefSavedRecipes;
