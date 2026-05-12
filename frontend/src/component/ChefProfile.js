import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import LoadingSpinner from './common/LoadingSpinner';
import '../style/ChefProfile.css';

const ChefProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getMe();
        if (data.role !== 'cook' && data.role !== 'chef') {
          navigate('/login');
          return;
        }
        setUser(data);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) return <LoadingSpinner message="Loading your profile..." />;
  if (!user) return null;

  return (
    <div className="chef-profile-container">
      <div className="chef-profile-header">
        <div className="cover-image"></div>
        <div className="profile-info">
          <div className="profile-info-content">
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                ) : (
                  <span>{user.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="profile-badge">✓</div>
            </div>
            <div className="profile-details">
              <h1 className="profile-name">
                {user.name} 
                <span className="profile-verified-badge">Chef vérifié</span>
              </h1>
              <p className="profile-role">
                <span>Professional Chef</span>
              </p>
              <p className="profile-nationality">
                <span>🌍 </span>
                <span>{user.nationality || 'France'}</span>
              </p>
              <div className="profile-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="rating-star">★</span>
                ))}
                <span style={{marginLeft: '0.5rem', fontSize: '0.9rem'}}>{user.rating || '4.8'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-details-section">
        <div className="profile-section">
          <h3>Basic Information</h3>
          <div className="info-item">
            <label>Name:</label>
            <span>{user.name}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          <div className="info-item">
            <label>Role:</label>
            <span>Professional Chef</span>
          </div>
          <div className="info-item">
            <label>Country:</label>
            <span>{user.nationality || 'France'}</span>
          </div>
          <div className="info-item">
            <label>Member Since:</label>
            <span>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <div className="profile-section">
          <h3>Statistics</h3>
          <div className="info-item">
            <label>Total Recipes:</label>
            <span>{user.recipes_count || 0}</span>
          </div>
          <div className="info-item">
            <label>Total Orders:</label>
            <span>{user.orders_count || 0}</span>
          </div>
          <div className="info-item">
            <label>Rating:</label>
            <span>{user.rating || '4.8'}/5</span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span className="status-badge approved">Approved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefProfile;