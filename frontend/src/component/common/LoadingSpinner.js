import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="loading-spinner"></div>
        <p className="spinner-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
