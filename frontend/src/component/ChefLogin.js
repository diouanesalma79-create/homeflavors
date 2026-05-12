import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../style/ChefLogin.css';

const ChefLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    nationality: '',
    addRecipe: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: 'cook',
        nationality: formData.nationality,
        bio: formData.addRecipe // Mapping addRecipe to bio
      });
      
      alert('Chef registration successful! Welcome to HomeFlavors.');
      navigate('/login/chef');
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
    <div className="chef-login-page">
      <div className="chef-login-container">
        <h1>Home Chef Registration</h1>
        <p className="subtitle">Join our community of passionate home cooks</p>
        
        <form className="chef-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
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
              value={formData.fullName}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.fullName ? 'error' : ''}
              placeholder="Enter your full name"
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="nationality">Nationality *</label>
            <select
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              disabled={isLoading}
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
              value={formData.addRecipe}
              onChange={handleChange}
              disabled={isLoading}
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
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
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
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
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

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register as Chef'}
          </button>
        </form>

        <div className="back-link">
          <p>Back to <Link to="/">Home</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ChefLogin;