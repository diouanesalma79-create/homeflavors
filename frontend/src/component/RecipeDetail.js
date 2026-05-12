import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import recipeService from '../services/recipeService';
import authService from '../services/authService';
import LoadingSpinner from './common/LoadingSpinner';
import '../style/RecipeDetail.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [userLocation, setUserLocation] = useState('Spain'); // Preserving original mock logic for design compatibility

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const data = await recipeService.getOne(id);
        setRecipe(data);
        
        // Use authService to check if saved (if applicable now)
        // For now, keeping original logic structure
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.savedRecipes) {
          setIsSaved(currentUser.savedRecipes.some(r => r.id === parseInt(id)));
        }
      } catch (err) {
        console.error('Error loading recipe:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
    window.scrollTo(0, 0);
  }, [id]);

  const handleSaveRecipe = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      alert('Please log in to save recipes');
      return;
    }

    if (recipe) {
      try {
        await recipeService.toggleFavorite(recipe.id);
        setIsSaved(true);
        setSaveMessage('✅ Recette enregistrée');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (err) {
        console.error('Error saving recipe:', err);
      }
    }
  };



  if (loading) return <LoadingSpinner message="Unfolding culinary secrets..." />;

  if (!recipe) {
    return (
      <div className="recipe-detail-error">
        <h2>Recipe not found</h2>
        <Link to="/recipes" className="back-to-recipes-link">Back to Recipes</Link>
      </div>
    );
  }

  return (
    <div className="recipe-detail-page">
      <div className="recipe-detail-container">
        <Link to="/recipes" className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Recipes
        </Link>
        
        <div className="recipe-layout">
          {/* Left Column: Image */}
          <div className="recipe-media">
            <div className="image-wrapper">
              <img src={recipe.image} alt={recipe.title} className="recipe-img" />
            </div>
          </div>
          
          {/* Right Column: Content */}
          <div className="recipe-content">
            <div className="recipe-header">
              <h1 className="recipe-title">{recipe.title}</h1>
              {recipe.chefName && recipe.chefName.trim() !== '' && !recipe.chefName.toLowerCase().includes('unknown') && (
                <div className="recipe-meta">
                  <span className="meta-chef">
                    By <Link to={`/chef/${recipe.chefId}`}>{recipe.chefName}</Link>
                  </span>
                  {recipe.country && recipe.country.trim() !== '' && !recipe.country.toLowerCase().includes('unknown') && (
                    <span className="meta-region">• {recipe.country}</span>
                  )}
                </div>
              )}
            </div>
            
            <p className="recipe-description">{recipe.description}</p>
            
            <div className="ingredients-card">
              <h3 className="ingredients-title">Ingredients</h3>
              <ul className="ingredients-list">
                {Array.isArray(recipe.ingredients) ? recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="ingredient-item">
                    <span className="bullet"></span>
                    <span className="ingredient-text">{ingredient.trim()}</span>
                  </li>
                )) : (
                  <li className="ingredient-item">
                    <span className="bullet"></span>
                    <span className="ingredient-text">{recipe.ingredients}</span>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="recipe-actions">
              {recipe.youtubeUrl && (
                <button 
                  className="btn-modern btn-video" 
                  onClick={() => window.open(recipe.youtubeUrl, '_blank', 'noopener,noreferrer')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  Watch Tutorial
                </button>
              )}

              <button 
                className={`btn-modern btn-save ${isSaved ? 'saved' : ''}`}
                onClick={handleSaveRecipe}
                disabled={isSaved}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
            {saveMessage && <div className="save-message">{saveMessage}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;