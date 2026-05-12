
import React from 'react';
import '../style/LoginPage.css'; 

import { Link } from 'react-router-dom';

export const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="fw-bold text-center mb-4">HomeFlavors</h2>
        <input type="text" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button>Login</button>
        <div className="signup-link">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

