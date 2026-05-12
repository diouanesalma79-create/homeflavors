import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import recipeService from '../services/recipeService';
import '../style/AddRecipeForm.css';

const AddRecipeForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    ingredients: '',
    steps: '',
    prepTime: '',
    cookTime: '',
    category: 'Plat',
    servings: '',
    visibility: 'Public',
    price: '' // Added for current API compatibility
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const checkRole = async () => {
        try {
            const currentUser = await authService.getMe();
            if (!currentUser || currentUser.role !== 'cook') {
                navigate('/login/visitor_Form');
                return;
            }
            setUser(currentUser);
        } catch (err) {
            navigate('/login/visitor_Form');
        }
    };
    checkRole();
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }

    if (!formData.image) {
      newErrors.image = 'Une image est obligatoire';
    }

    if (!formData.ingredients.trim()) {
      newErrors.ingredients = 'Au moins un ingrédient est requis';
    }

    if (!formData.steps.trim()) {
      newErrors.steps = 'Au moins une étape est requise';
    }

    if (!formData.prepTime || formData.prepTime <= 0) {
      newErrors.prepTime = 'Temps de préparation invalide';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Prix invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };



  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      
    if (!validateForm()) {
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('ingredients', formData.ingredients.trim());
      data.append('instructions', formData.steps.trim());
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('prep_time', formData.prepTime);
      data.append('cook_time', formData.cookTime || 0);
      data.append('servings', formData.servings || 1);
      
      if (formData.image) {
        data.append('image', formData.image);
      }
  
      await recipeService.create(data);
  
      setSuccessMessage('✅ Recette ajoutée avec succès!');
      setTimeout(() => {
        navigate('/chef/recipes');
      }, 2000);
  
    } catch (error) {
      console.error('Error submitting recipe:', error);
      setErrors({ submit: error.response?.data?.message || 'Erreur lors de l\'ajout de la recette' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/chef');
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="add-recipe-page">
      <div className="add-recipe-container">
        <div className="form-header">
          <h1>Add a New Recipe</h1>
          <p>Share your culinary expertise with the HomeFlavors community</p>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form className="recipe-form" onSubmit={handleSubmit}>
          {/* Title Field */}
          <div className="form-group">
            <label htmlFor="title">Recipe Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'error' : ''}
              placeholder="Enter the name of your recipe"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="image">Recipe Image *</label>
            <input
              type="file"
              id="image"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleImageUpload}
              className={errors.image ? 'error' : ''}
            />
            {errors.image && <span className="error-message">{errors.image}</span>}
            {formData.image && (
              <div className="image-preview">
                <img 
                  src={URL.createObjectURL(formData.image)} 
                  alt="Preview" 
                />
                <p>{formData.image.name}</p>
              </div>
            )}
          </div>

          {/* Price Field */}
          <div className="form-group">
            <label htmlFor="price">Prix (€) *</label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className={errors.price ? 'error' : ''}
              placeholder="Ex: 15.50"
              step="0.01"
            />
            {errors.price && <span className="error-message">{errors.price}</span>}
          </div>

          {/* Ingredients */}
          <div className="form-group">
            <label htmlFor="ingredients">Ingredients (comma separated or one per line) *</label>
            <textarea
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => handleInputChange('ingredients', e.target.value)}
              className={errors.ingredients ? 'error' : ''}
              placeholder="e.g. 2 eggs, 1 cup flour, 1/2 cup sugar"
              rows="4"
            />
            {errors.ingredients && <span className="error-message">{errors.ingredients}</span>}
          </div>

          {/* Steps */}
          <div className="form-group">
            <label htmlFor="steps">Preparation Steps (one per line) *</label>
            <textarea
              id="steps"
              value={formData.steps}
              onChange={(e) => handleInputChange('steps', e.target.value)}
              className={errors.steps ? 'error' : ''}
              placeholder="e.g. 1. Mix the dry ingredients...&#10;2. Add the wet ingredients..."
              rows="6"
            />
            {errors.steps && <span className="error-message">{errors.steps}</span>}
          </div>

          {/* Prep Time & Cook Time */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prepTime">Preparation Time (min) *</label>
              <input
                type="number"
                id="prepTime"
                value={formData.prepTime}
                onChange={(e) => handleInputChange('prepTime', e.target.value)}
                className={errors.prepTime ? 'error' : ''}
                min="1"
              />
              {errors.prepTime && <span className="error-message">{errors.prepTime}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cookTime">Cooking Time (min)</label>
              <input
                type="number"
                id="cookTime"
                value={formData.cookTime}
                onChange={(e) => handleInputChange('cookTime', e.target.value)}
                className={errors.cookTime ? 'error' : ''}
                min="0"
              />
              {errors.cookTime && <span className="error-message">{errors.cookTime}</span>}
            </div>
          </div>

          {/* Servings & Category */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="servings">Servings *</label>
              <input
                type="number"
                id="servings"
                value={formData.servings}
                onChange={(e) => handleInputChange('servings', e.target.value)}
                className={errors.servings ? 'error' : ''}
                min="1"
              />
              {errors.servings && <span className="error-message">{errors.servings}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="Entrée">Starter</option>
                <option value="Plat">Main Course</option>
                <option value="Dessert">Dessert</option>
                <option value="Vegan">Vegan</option>
                <option value="Végétarien">Vegetarian</option>
                <option value="Sans gluten">Gluten-Free</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddRecipeForm;