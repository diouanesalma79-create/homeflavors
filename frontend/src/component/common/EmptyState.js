import React from 'react';
import './EmptyState.css';

const EmptyState = ({ title, message, icon }) => {
    return (
        <div className="empty-state-container">
            <div className="empty-state-icon">{icon}</div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-message">{message}</p>
        </div>
    );
};

export default EmptyState;
