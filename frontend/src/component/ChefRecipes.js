import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import profileService from '../services/profileService';
import LoadingSpinner from './common/LoadingSpinner';
import ChefOrderModal from './ChefOrderModal';
import '../style/ChefRecipes.css';

const ChefRecipes = () => {
    const { chefId } = useParams();
    const [chef, setChef] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    useEffect(() => {
        const fetchChefData = async () => {
            try {
                const chefResponse = await profileService.getChefProfile(chefId);
                if (chefResponse.profile) {
                    setChef(chefResponse.profile);
                    setRecipes(chefResponse.recipes || []);
                } else {
                    setChef(chefResponse);
                    const recipesData = await profileService.getChefRecipes(chefId);
                    setRecipes(recipesData.data || recipesData || []);
                }
            } catch (err) {
                console.error('Error fetching chef details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChefData();
    }, [chefId]);

    if (loading) return <LoadingSpinner message="Visiting the chef's kitchen..." />;
    if (!chef) return <div className="error-message">Chef not found.</div>;

    return (
        <div className="chef-recipes-page">
            {/* Chef Header Section */}
            <section className="chef-header">
                <div className="chef-profile">
                    <div className="chef-avatar">
                        {chef.profilePhoto ? (
                            <img src={chef.profilePhoto} alt={chef.name} />
                        ) : (
                            <span>{chef.name?.charAt(0) || 'U'}</span>
                        )}
                    </div>
                    <div className="chef-details">
                        <h1>{chef.name}</h1>
                        <p className="chef-country">From {chef.nationality || chef.city || 'Home Flavors'}</p>
                        <p className="chef-description">{chef.bio || "Bringing traditional family flavors to your table with love and care."}</p>
                        <p className="chef-recipe-count">{recipes.length} recipes</p>
                    </div>
                </div>
            </section>

            {/* Recipes Grid */}
            <section className="chef-recipes-section">
                <div className="section-container">
                    <h2 className="section-title">Recipes by {chef.name?.split(' ')[0] || 'Chef'}</h2>
                    {recipes.length > 0 ? (
                        <div className="recipes-grid">
                            {recipes.map(recipe => (
                                <div key={recipe.id} className="recipe-card">
                                    <div className="recipe-image-container">
                                        <img src={recipe.image} alt={recipe.title} className="recipe-image" />
                                    </div>
                                    <div className="recipe-info">
                                        <h3 className="recipe-title">{recipe.title}</h3>
                                        <p className="recipe-description">{recipe.description?.substring(0, 100) || "Delicious artisan recipe."}</p>
                                        <div className="recipe-actions">
                                            <Link to={`/recipe/${recipe.id}`} className="view-recipe-btn">
                                                View Recipe
                                            </Link>
                                            <button
                                                type="button"
                                                className="view-recipe-btn"
                                                onClick={() => setSelectedRecipe(recipe)}
                                            >
                                                Order
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-recipes">No recipes available from this chef yet.</p>
                    )}
                </div>
            </section>
            <ChefOrderModal
                isOpen={!!selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
                dish={selectedRecipe}
            />
        </div>
    );
};

export default ChefRecipes;
