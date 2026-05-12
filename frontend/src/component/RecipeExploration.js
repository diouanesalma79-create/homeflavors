import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import recipeService from '../services/recipeService';
import LoadingSpinner from './common/LoadingSpinner';
import backgroundImage from '../assets/logo/background2.png';
import '../style/RecipeExploration.css';

const RECIPES_PER_PAGE = 6;

const RecipeExploration = () => {
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContinent, setSelectedContinent] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);

    // Continents (Original UI requirement)
    const continents = [
        { id: 'all', name: 'All recipes' },
        { id: 'Africa', name: 'Africa' },
        { id: 'Asia', name: 'Asia' },
        { id: 'Europe', name: 'Europe' },
        { id: 'NorthAmerica', name: 'North America' },
        { id: 'SouthAmerica', name: 'South America' }
    ];

    // Initial load and filter change
    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                setLoading(true);
                // Trigger API call with search and continent filters
                const params = {
                    per_page: 100, // Fetch all to remove limits from backend
                    search: searchTerm.trim() || undefined,
                    continent: selectedContinent !== 'all' ? selectedContinent : undefined
                };
                const data = await recipeService.getAll(params);
                setRecipes(data.items || []);
            } catch (err) {
                console.error('Error fetching recipes:', err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search to avoid excessive API calls
        const timer = setTimeout(() => {
            fetchRecipes();
        }, searchTerm ? 500 : 0);

        return () => clearTimeout(timer);
    }, [searchTerm, selectedContinent]);

    // Apply client-side filtering if needed, though backend handles it, 
    // we keep this just in case, but here we just pass through since backend does it
    useEffect(() => {
        setFilteredRecipes(recipes);
        setCurrentPage(0);
    }, [recipes, searchTerm, selectedContinent]);

    // Pagination logic
    const startIndex = currentPage * RECIPES_PER_PAGE;
    const endIndex = startIndex + RECIPES_PER_PAGE;
    const visibleRecipes = filteredRecipes.slice(startIndex, endIndex);

    if (loading) return <LoadingSpinner message="Discovering flavors..." />;

    return (
        <div
            className="recipe-exploration"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Header */}
            <div className="exploration-header">
                <h1 className="exploration-title">
                    Explore the Recipe Catalog
                </h1>

                <form className="search-container" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="text"
                        placeholder="Search by ingredient or recipe name..."
                        className="search-bar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="button" className="search-button">
                        Search
                    </button>
                </form>
            </div>

            {/* Continent Filters */}
            <div className="categories-section">
                <div className="category-buttons">
                    {continents.map(continent => (
                        <button
                            key={continent.id}
                            className={`category-btn ${
                                selectedContinent === continent.id ? 'active' : ''
                            }`}
                            onClick={() => setSelectedContinent(continent.id)}
                        >
                            {continent.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recipes Grid */}
            <div className="recipes-grid">
                {visibleRecipes.map(recipe => (
                    <div className="recipe-card" key={recipe.id}>
                        <div className="recipe-image-container">
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="recipe-image"
                            />
                        </div>

                        <div className="recipe-content">
                            <h3 className="recipe-title">{recipe.title}</h3>
                            <p className="recipe-description">
                                {recipe.description?.substring(0, 120)}...
                            </p>

                            <div className="card-buttons">
                                <Link
                                    to={`/recipe/${recipe.id}`}
                                    className="show-more-btn"
                                >
                                    <button>Show More</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {/* PREVIOUS CARD */}
                {currentPage > 0 && (
                    <div
                        className="recipe-card voir-plus-card previous-card"
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        <div className="voir-plus-content">
                            <span className="arrow">←</span>
                            <h3>Previous</h3>
                            <p>Go back</p>
                        </div>
                    </div>
                )}

                {/* NEXT CARD */}
                {endIndex < filteredRecipes.length && (
                    <div
                        className="recipe-card voir-plus-card next-card"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        <div className="voir-plus-content">
                            <span className="arrow">→</span>
                            <h3>View more</h3>
                            <p>Discover more recipes</p>
                        </div>
                    </div>
                )}
            </div>
            
            {filteredRecipes.length === 0 && !loading && (
                <div className="no-results-container">
                    <p style={{ textAlign: 'center', color: '#6b3f1d', gridColumn: '1/-1', padding: '2rem' }}>
                        No recipes found matching your criteria.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RecipeExploration;
