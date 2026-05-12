import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import profileService from '../services/profileService';
import LoadingSpinner from './common/LoadingSpinner';
import '../style/ChefSettings.css';

const ChefSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    language: 'en',
    bio: '',
    specialty: '',
    nationality: '',
    phone: '',
    address: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await authService.getMe();
        if (data.role !== 'cook' && data.role !== 'chef') {
            navigate('/recipes');
            return;
        }
        setUser(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          newPassword: '',
          confirmPassword: '',
          language: 'en',
          bio: data.bio || '',
          specialty: data.specialty || '',
          nationality: data.nationality || '',
          phone: data.phone || '',
          address: data.address || ''
        });
        if (data.profilePhoto) {
          setPreviewUrl(data.profilePhoto);
        }
      } catch (err) {
        navigate('/login/visitor_Form');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [navigate]);

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setPreviewUrl(user?.profilePhoto || '');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    setMessage('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      data.append('nationality', formData.nationality);
      
      if (avatar) {
        data.append('profile_picture', avatar);
      }
      
      if (formData.newPassword) {
        data.append('password', formData.newPassword);
      }

      await profileService.updateProfile(data);

      setMessage('Profile updated successfully!');
      setTimeout(() => navigate('/dashboard/chef'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="chef-settings-container">
      <div className="chef-settings-card">
        <h2>Profile Settings</h2>
        
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form className="chef-settings-form" onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-preview">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile Preview" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            
            <div className="avatar-controls">
              <input
                type="file"
                id="avatar-upload"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleAvatarChange}
                className="avatar-input"
              />
              <label htmlFor="avatar-upload" className="upload-btn">
                Change Avatar
              </label>
              
              {avatar && (
                <button type="button" className="remove-btn" onClick={removeAvatar}>
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address (ReadOnly)</label>
              <input type="email" id="email" value={formData.email} readOnly disabled />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself as a chef"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="nationality">Nationality</label>
                <input
                  type="text"
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Security</h3>
            <div className="form-group">
              <label htmlFor="newPassword">New Password (optional)</label>
              <input
                type="password"
                id="newPassword"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={errors.newPassword ? 'error' : ''}
                placeholder="Leave blank to keep current password"
              />
              {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChefSettings;