import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import profileService from '../services/profileService';
import LoadingSpinner from './common/LoadingSpinner';
import chefBg from '../assets/logo/backgroundChef.jpeg';
import '../style/Chefs.css';

const Chefs = () => {
    const [chefs, setChefs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChefs = async () => {
            try {
                const data = await profileService.getChefs();
                setChefs(data.data || data); // Handle both paginated and plain arrays
            } catch (err) {
                console.error('Error fetching chefs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChefs();
    }, []);

    if (loading) return <LoadingSpinner message="Loading chefs..." />;

    return (
        <div className="chefs-page">
            <div className="chefs-banner">
                <img src={chefBg} alt="Chefs Banner" className="chefs-banner-image" />
                <div className="chefs-banner-overlay">
                    <h1>Meet Our Chefs</h1>
                </div>
            </div>

            <div className="chefs-container">
                <div className="chefs-grid">
                    {chefs.length > 0 ? chefs.map(chef => (
                        <div key={chef.id} className="chef-card">
                            <div className="chef-image-container">
                                {chef.profilePhoto || chef.profile_picture_url ? (
                                    <img 
                                        src={chef.profilePhoto || chef.profile_picture_url} 
                                        alt={chef.name} 
                                        className="chef-image"
                                    />
                                ) : (
                                    <div className="chef-placeholder">
                                        {chef.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="chef-info">
                                <h3>{chef.name}</h3>
                                <p>{chef.bio || "Crafting traditional masterpieces with a modern soul and authentic ingredients."}</p>
                                <Link to={`/chef/${chef.id}`} className="chef-link">View Portfolio</Link>
                            </div>
                        </div>
                    )) : (
                        <p className="no-chefs">No chefs available at the moment.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chefs;