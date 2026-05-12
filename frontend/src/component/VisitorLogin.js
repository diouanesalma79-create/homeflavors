import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../style/VisitorLogin.css';

const VisitorLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
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
    
    // Validation
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
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
      const data = new FormData();
      data.append('name', formData.fullName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('password_confirmation', formData.confirmPassword);
      data.append('role', 'customer');
      if (formData.profilePhoto) {
        data.append('profile_picture', formData.profilePhoto);
      }

      await authService.register(data);
      
      alert(`Welcome ${formData.fullName}! Your registration is complete.`);
      navigate('/login/visitor_Form');
    } catch (error) {
       setErrors({ general: error.response?.data?.message || 'Registration failed' });
    } finally {
      setIsLoading(true);
    }
  };

  return (
    <div className="visitor-login-page">
      <div className="visitor-login-container">
        <h1>Visitor Registration</h1>
        <p className="subtitle">Join our community to receive recipe notifications</p>
        
        <form className="visitor-form" onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label htmlFor="profilePhoto">Profile Photo (Optional)</label>
            <input
              type="file"
              id="profilePhoto"
              name="profilePhoto"
              accept="image/*"
              onChange={handleChange}
              disabled={isLoading}
              className={errors.profilePhoto ? 'error' : ''}
            />
            {previewImage && (
              <div className="photo-preview">
                <img src={previewImage} alt="Profile preview" />
              </div>
            )}
            {errors.profilePhoto && <span className="error-message">{errors.profilePhoto}</span>}
          </div>

          {errors.general && (
            <div className="error-message general-error" style={{color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>
              {errors.general}
            </div>
          )}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register as Visitor'}
          </button>
        </form>

         <div className="back-link">
          <p>Have an account? <span onClick={() => navigate('/login/visitor_Form')} style={{color: '#8a5a44', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer'}}>Sign in here</span></p>
        </div>
      </div>
    </div>
  );
};

export default VisitorLogin;