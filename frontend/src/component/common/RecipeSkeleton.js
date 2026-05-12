import React from 'react';
import './RecipeSkeleton.css';

const RecipeSkeleton = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image shimmer"></div>
            <div className="skeleton-content">
                <div className="skeleton-category shimmer"></div>
                <div className="skeleton-title shimmer"></div>
                <div className="skeleton-footer">
                    <div className="skeleton-meta shimmer"></div>
                    <div className="skeleton-meta shimmer"></div>
                </div>
            </div>
        </div>
    );
};

export const RecipeGridSkeleton = ({ count = 6 }) => {
    return (
        <div className="recipes-grid">
            {Array(count).fill(0).map((_, i) => (
                <RecipeSkeleton key={i} />
            ))}
        </div>
    );
};

export default RecipeSkeleton;
