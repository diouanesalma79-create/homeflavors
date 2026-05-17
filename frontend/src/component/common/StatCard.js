import React from 'react';
import '../../style/ChefShared.css';

const StatCard = ({ icon, value, label, tone = 'earth' }) => (
  <article className={`hf-stat-card hf-stat-${tone}`}>
    <div className="hf-stat-icon">{icon}</div>
    <div>
      <strong className="hf-stat-value">{value}</strong>
      <span className="hf-stat-label">{label}</span>
    </div>
  </article>
);

export default StatCard;
