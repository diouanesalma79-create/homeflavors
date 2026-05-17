import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import recipeService from '../services/recipeService';
import '../style/AddRecipeForm.css';

const AddRecipeForm = ({ isModal, onClose, onSuccess, recipeToEdit }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(() => {
    if (recipeToEdit) {
      return {
        title: recipeToEdit.title || '',
        image: null,
        ingredients: Array.isArray(recipeToEdit.ingredients) 
          ? recipeToEdit.ingredients.join(', ') 
          : (recipeToEdit.ingredients || ''),
        steps: recipeToEdit.instructions || recipeToEdit.steps || '',
        prepTime: recipeToEdit.prep_time || recipeToEdit.prep_time_minutes || '',
        cookTime: recipeToEdit.cook_time || '',
        category: recipeToEdit.category || 'Plat',
        visibility: recipeToEdit.visibility || 'Public',
        price: recipeToEdit.price || ''
      };
    }
    return {
      title: '',
      image: null,
      ingredients: '',
      steps: '',
      prepTime: '',
      cookTime: '',
      category: 'Plat',
      visibility: 'Public',
      price: ''
    };
  });

  useEffect(() => {
    if (recipeToEdit) {
      setFormData({
        title: recipeToEdit.title || '',
        image: null,
        ingredients: Array.isArray(recipeToEdit.ingredients) 
          ? recipeToEdit.ingredients.join(', ') 
          : (recipeToEdit.ingredients || ''),
        steps: recipeToEdit.instructions || recipeToEdit.steps || '',
        prepTime: recipeToEdit.prep_time || recipeToEdit.prep_time_minutes || '',
        cookTime: recipeToEdit.cook_time || '',
        category: recipeToEdit.category || 'Plat',
        visibility: recipeToEdit.visibility || 'Public',
        price: recipeToEdit.price || ''
      });
    }
  }, [recipeToEdit]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const checkRole = async () => {
        try {
            const currentUser = await authService.getMe();
            if (!currentUser || currentUser.role !== 'cook') {
                if (!isModal) navigate('/login/visitor_Form');
                return;
            }
            setUser(currentUser);
        } catch (err) {
            if (!isModal) navigate('/login/visitor_Form');
        }
    };
    checkRole();
  }, [navigate, isModal]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!recipeToEdit && !formData.image) newErrors.image = 'Image is required';
    if (!formData.ingredients.trim()) newErrors.ingredients = 'Ingredients are required';
    if (!formData.steps.trim()) newErrors.steps = 'Steps are required';
    if (!formData.prepTime || formData.prepTime <= 0) newErrors.prepTime = 'Invalid prep time';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Invalid price';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
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
      if (formData.image) data.append('image', formData.image);
  
      if (recipeToEdit) {
        await recipeService.update(recipeToEdit.id, data);
        setSuccessMessage('✅ Recipe updated successfully!');
      } else {
        await recipeService.create(data);
        setSuccessMessage('✅ Recipe added successfully!');
      }
  
      setTimeout(() => {
        if (isModal) {
            onSuccess && onSuccess();
            onClose && onClose();
        } else {
            navigate('/chef/recipes');
        }
      }, 1500);
  
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Error saving recipe' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isModal) {
        onClose && onClose();
    } else {
        navigate('/dashboard/chef');
    }
  };

  if (!user && !isModal) return <div>Loading...</div>;

  return (
    <div className={isModal ? "recipe-modal-content" : "add-recipe-page"}>
      <div className={isModal ? "modal-inner-form" : "add-recipe-container"}>
        <div className="form-header">
          <h1>{recipeToEdit ? "Edit Recipe" : (isModal ? "Create New Recipe" : "Add a New Recipe")}</h1>
          <p>{recipeToEdit ? "Modify your recipe details below" : "Fill in the details below to share your creation"}</p>
          {isModal && <button className="close-modal-btn" onClick={onClose}>×</button>}
        </div>

        {successMessage && <div className="success-message">{successMessage}</div>}

        <form className="recipe-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-column">
                <div className="form-group">
                    <label>Recipe Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={errors.title ? 'error' : ''}
                        placeholder="e.g. Grandma's Apple Pie"
                    />
                    {errors.title && <span className="error-message">{errors.title}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Category</label>
                        <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)}>
                            <option value="Entrée">Starter</option>
                            <option value="Plat">Main Course</option>
                            <option value="Dessert">Dessert</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Végétarien">Vegetarian</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Price (€) *</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className={errors.price ? 'error' : ''}
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Prep (min) *</label>
                    <input
                        type="number"
                        value={formData.prepTime}
                        onChange={(e) => handleInputChange('prepTime', e.target.value)}
                        className={errors.prepTime ? 'error' : ''}
                    />
                </div>

                <div className="form-group">
                    <label>Recipe Image {recipeToEdit ? '' : '*'}</label>
                    <div className="image-upload-wrapper">
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                        {formData.image && <span className="file-name">{formData.image.name}</span>}
                    </div>
                    {errors.image && <span className="error-message">{errors.image}</span>}
                </div>
            </div>

            {/* Right Column */}
            <div className="form-column">
                <div className="form-group">
                    <label>Ingredients *</label>
                    <textarea
                        value={formData.ingredients}
                        onChange={(e) => handleInputChange('ingredients', e.target.value)}
                        placeholder="List ingredients separated by commas..."
                        rows="4"
                    />
                </div>
                <div className="form-group">
                    <label>Preparation Steps *</label>
                    <textarea
                        value={formData.steps}
                        onChange={(e) => handleInputChange('steps', e.target.value)}
                        placeholder="Describe the steps to cook this recipe..."
                        rows="6"
                    />
                </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-btn">Cancel</button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (recipeToEdit ? 'Save Changes' : 'Publish Recipe')}
            </button>
          </div>

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
        </form>
      </div>
    </div>
  );
};

export default AddRecipeForm;