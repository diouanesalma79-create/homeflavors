import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../style/BecomeAChef.css';

const BecomeAChef = () => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    nationality: '',
    addRecipe: '',
    password: '',
    confirmPassword: '',
    profilePhoto: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePhoto') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, profilePhoto: file }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Comprehensive validation (Preserving original rules)
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.addRecipe) newErrors.addRecipe = 'Recipe description is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.fullName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('password_confirmation', formData.confirmPassword);
      data.append('nationality', formData.nationality);
      data.append('bio', formData.addRecipe);
      data.append('role', 'cook');
      if (formData.profilePhoto) {
        data.append('profile_picture', formData.profilePhoto);
      }

      await authService.register(data);
      
      alert(`Welcome ${formData.fullName}! Your registration as a Home Chef is complete.`);
      navigate('/dashboard/chef');
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const nationalities = [
    'Algerian', 'American', 'Argentine', 'Australian', 'Austrian',
    'Bangladeshi', 'Belgian', 'Brazilian', 'British', 'Canadian',
    'Chilean', 'Chinese', 'Colombian', 'Cuban', 'Danish',
    'Dutch', 'Egyptian', 'Ethiopian', 'Filipino', 'Finnish',
    'French', 'German', 'Ghanaian', 'Greek', 'Indian',
    'Indonesian', 'Iranian', 'Irish', 'Israeli', 'Italian',
    'Japanese', 'Kenyan', 'Korean', 'Lebanese', 'Malaysian',
    'Mexican', 'Moroccan', 'Nigerian', 'Norwegian', 'Pakistani',
    'Peruvian', 'Polish', 'Portuguese', 'Russian', 'Saudi',
    'Singaporean', 'South African', 'Spanish', 'Swedish', 'Swiss',
    'Thai', 'Turkish', 'Ukrainian', 'Uruguayan', 'Venezuelan',
    'Vietnamese'
  ];

  return (
    <div className="become-chef-page">
      <div className="become-chef-container">
        <h1>Become a Home Chef</h1>
        <p className="subtitle">Join our community of passionate home cooks</p>
        
        <form className="become-chef-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              disabled={isLoading}
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              disabled={isLoading}
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'error' : ''}
              placeholder="Enter your full name"
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="profilePhoto">Profile Photo (Optional)</label>
            <input
              type="file"
              id="profilePhoto"
              name="profilePhoto"
              accept="image/*"
              disabled={isLoading}
              onChange={handleChange}
            />
            {previewImage && (
              <div className="photo-preview">
                <img src={previewImage} alt="Profile preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="nationality">Nationality *</label>
            <select
              id="nationality"
              name="nationality"
              disabled={isLoading}
              value={formData.nationality}
              onChange={handleChange}
              className={errors.nationality ? 'error' : ''}
            >
              <option value="">Select your nationality</option>
              {nationalities.map(nation => (
                <option key={nation} value={nation}>{nation}</option>
              ))}
            </select>
            {errors.nationality && <span className="error-message">{errors.nationality}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="addRecipe">Add Recipe *</label>
            <textarea
              id="addRecipe"
              name="addRecipe"
              disabled={isLoading}
              value={formData.addRecipe}
              onChange={handleChange}
              className={errors.addRecipe ? 'error' : ''}
              placeholder="Tell us about your signature recipe (required)"
              rows="4"
            />
            {errors.addRecipe && <span className="error-message">{errors.addRecipe}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              disabled={isLoading}
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Create a password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              disabled={isLoading}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {errors.general && (
            <div className="error-message general-error" style={{color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>
              {errors.general}
            </div>
          )}

          <div className="form-buttons">
            <button 
              type="button" 
              className="cancel-button"
              disabled={isLoading}
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register as Chef'}
            </button>
          </div>
        </form>

        <div className="login-link">
          <p>Already have an account? <Link to="/login/chef">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default BecomeAChef;