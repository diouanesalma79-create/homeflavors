import React from 'react';
import { Link } from 'react-router-dom';
import '../style/UserTypeSelection.css';

const UserTypeSelection = () => {
  return (
    <div className="user-type-selection-page">
      <div className="selection-container">
        <h1>Welcome Back!</h1>
        <p className="subtitle">Are you visiting or sharing recipes today?</p>
        
        <div className="user-type-options">
          <Link to="/login/visitor_Form" className="option-card visitor-option">
            <div className="option-icon">👥</div>
            <h3>I'm a Visitor</h3>
            <p>Browse recipes, discover new flavors, and enjoy cooking inspiration</p>
          </Link>
          
          <Link to="/login/chef" className="option-card chef-option">
            <div className="option-icon">👨‍🍳</div>
            <h3>I'm a Home Chef</h3>
            <p>Manage my recipes and connect with fellow cooking enthusiasts</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;