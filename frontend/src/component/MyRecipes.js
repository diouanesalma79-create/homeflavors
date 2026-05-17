import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import recipeService from '../services/recipeService';
import authService from '../services/authService';
import LoadingSpinner from './common/LoadingSpinner';
import AddRecipeForm from './AddRecipeForm';
import '../style/ChefRecipes.css';

const MyRecipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  const fetchMyRecipes = useCallback(async () => {
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
  }, [navigate]);

  useEffect(() => {
    fetchMyRecipes();
  }, [fetchMyRecipes]);

  useEffect(() => {
    if (isModalOpen || editingRecipe) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, editingRecipe]);

  const handleAddRecipe = () => {
    setIsModalOpen(true);
  };



  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
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

  if (loading && !isModalOpen) return <LoadingSpinner message="Fetching your portfolio..." />;

  return (
    <div className="chef-recipes-page">
      <div className="recipes-header">
        <h2>My Recipes</h2>
        <button className="add-recipe-btn" onClick={handleAddRecipe}>
          + Add Recipe
        </button>
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
              </div>
              <div className="recipe-actions">
                <button 
                  className="edit-btn" 
                  onClick={() => handleEditRecipe(recipe)}
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

      {/* Add Recipe Modal */}
      {isModalOpen && (
        <div className="recipe-modal-overlay">
          <AddRecipeForm 
            isModal={true} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => fetchMyRecipes()} 
          />
        </div>
      )}

      {/* Edit Recipe Modal */}
      {editingRecipe && (
        <div className="recipe-modal-overlay">
          <AddRecipeForm 
            isModal={true} 
            recipeToEdit={editingRecipe}
            onClose={() => setEditingRecipe(null)} 
            onSuccess={() => fetchMyRecipes()} 
          />
        </div>
      )}
    </div>
  );
};

export default MyRecipes;