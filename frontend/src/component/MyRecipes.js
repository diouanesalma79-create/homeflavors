import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import recipeService from '../services/recipeService';
import authService from '../services/authService';
import LoadingSpinner from './common/LoadingSpinner';
import '../style/ChefRecipes.css';

const MyRecipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyRecipes = async () => {
      try {
        setLoading(true);
        const user = await authService.getMe();
        if (user.role !== 'cook' && user.role !== 'chef') {
            navigate('/recipes');
            return;
        }

        const data = await recipeService.getMyRecipes();
        setRecipes(data || []);
      } catch (err) {
        console.error('Error fetching your recipes:', err);
        setError('Failed to load your recipes.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyRecipes();
  }, [navigate]);

  const handleAddRecipe = () => {
    navigate('/dashboard/chef/recettes/nouvelle');
  };

  const handleEditRecipe = (recipeId) => {
    navigate(`/dashboard/chef/recettes/edit/${recipeId}`);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await recipeService.delete(recipeId);
        setRecipes(recipes.filter(r => r.id !== recipeId));
      } catch (err) {
        alert('Failed to delete recipe.');
      }
    }
  };

  if (loading) return <LoadingSpinner message="Fetching your portfolio..." />;

  return (
    <div className="chef-recipes-container">
      <div className="recipes-header">
        <h2>My Recipes</h2>
        {recipes.length > 0 && (
          <button className="add-recipe-btn" onClick={handleAddRecipe}>
            + Add Recipe
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {recipes.length === 0 ? (
        <div className="empty-state">
          <p>You haven't published any recipes yet.</p>
          <button className="add-first-recipe-btn" onClick={handleAddRecipe}>
            Add Your First Recipe
          </button>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <img src={recipe.image || '/placeholder-recipe.jpg'} alt={recipe.title} className="recipe-image" />
              <div className="recipe-info">
                <h3 className="recipe-title">{recipe.title}</h3>
                <p className="recipe-description">{recipe.description}</p>
                <div className="recipe-meta">
                  <span className="prep-time">⏱️ {recipe.prep_time || recipe.prepTime || 20} mins</span>
                  <span className="difficulty">🎯 {recipe.difficulty || 'Medium'}</span>
                  <span className="servings">👥 Serves {recipe.servings || 4}</span>
                </div>
                <div className="recipe-stats">
                  <span className="likes">❤️ {recipe.likes_count || 0}</span>
                  <span className="views">👁️ {recipe.views_count || 0}</span>
                </div>
              </div>
              <div className="recipe-actions">
                <button 
                  className="edit-btn" 
                  onClick={() => handleEditRecipe(recipe.id)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDeleteRecipe(recipe.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRecipes;