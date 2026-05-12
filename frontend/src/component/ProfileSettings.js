import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import profileService from '../services/profileService';
import LoadingSpinner from './common/LoadingSpinner';
import '../style/ProfileSettings.css';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    language: 'en'
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
        setUser(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          bio: data.bio || '',
          language: 'en'
        });
        if (data.profile_picture_url) {
          setPreviewUrl(data.profile_picture_url);
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage('Image size must be less than 2MB');
        return;
      }
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      data.append('bio', formData.bio);
      
      if (avatar) {
        data.append('profile_picture', avatar);
      }

      const updatedUser = await profileService.updateProfile(data);
      
      if (!updatedUser) throw new Error('No user data returned');
      
      // 1. Sync localStorage
      authService.updateCurrentUser(updatedUser);
      
      // 2. Sync local component state for instant UI refresh
      setUser(updatedUser);
      setFormData(prev => ({
        ...prev,
        name: updatedUser.name || '',
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        bio: updatedUser.bio || ''
      }));
      if (updatedUser.profile_picture_url) {
        setPreviewUrl(updatedUser.profile_picture_url);
        setAvatar(null); // Clear selected file as it's now saved
      }

      setMessage('Profile updated successfully!');
      // Removed redirect to keep user on the same page
    } catch (error) {
      console.error('Update failed:', error);
      setMessage(error.response?.data?.message || 'Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="profile-settings-container">
      <div className="profile-settings-card">
        <h2>Profile Settings</h2>
        
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form className="profile-settings-form" onSubmit={handleSubmit} encType="multipart/form-data">
          
          {/* Avatar Section */}
          <div className="avatar-upload-section">
            <div className="avatar-preview-container">
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar Preview" className="avatar-preview-img" />
              ) : (
                <div className="avatar-placeholder-v4">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <label htmlFor="avatar-input" className="avatar-edit-badge">
                <span>📸</span>
              </label>
            </div>
            
            <div className="avatar-upload-info">
              <h3>Profile Picture</h3>
              <p>JPG, PNG or WebP. Max size 2MB.</p>
              <input 
                type="file" 
                id="avatar-input" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                style={{display: 'none'}} 
              />
              <label htmlFor="avatar-input" className="upload-label-btn">
                Change Photo
              </label>
            </div>
          </div>
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address (ReadOnly)</label>
              <input type="email" value={formData.email} readOnly disabled />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your delivery address"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                className="bio-textarea"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell people about yourself, your cooking style, specialties…"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="save-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;