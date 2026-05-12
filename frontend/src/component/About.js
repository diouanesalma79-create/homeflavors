import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/About.css";
const About = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);
    
    const cards = document.querySelectorAll('.about-card');
    cards.forEach(card => {
      observer.observe(card);
    });
    
    // Staggered load for initial page load
    setTimeout(() => {
      cards.forEach((card, index) => {
        setTimeout(() => {
          if (!card.classList.contains('animate')) {
            card.classList.add('animate');
          }
        }, index * 100); // 100ms delay between each card
      });
    }, 100);
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);
  
  const handleExploreRecipes = () => {
    navigate('/recipes');
  };
  
  const handleMeetChefs = () => {
    navigate('/chefs');
  };
  
  return (
    <div className="about-container">
      <div className="about-grid">
        {/* Card 1 - Welcome */}
        <div className="about-card welcome-card">
          <h2 className="about-card-title">Welcome to HomeFlavors</h2>
          <p className="about-intro">HomeFlavors is your culinary space to discover, share, and savor recipes from around the world. Whether you're a passionate home cook or simply curious about new flavors, our platform connects you with chefs and food lovers everywhere.</p>
        </div>
        
        {/* Card 2 - Our Mission */}
        <div className="about-card mission-card">
          <h2 className="about-card-title">Our Mission</h2>
          <p>Our mission is to bring people together through food. We believe cooking is more than preparing meals—it's about culture, creativity, and connection.</p>
        </div>
        
        {/* Card 3 - Our Values */}
        <div className="about-card values-card">
          <h2 className="about-card-title">Our Values</h2>
          <ul className="about-values">
            <li>Community & Sharing</li>
            <li>Diversity of Flavors</li>
            <li>Accessibility & Simplicity</li>
            <li>Inspiration & Creativity</li>
          </ul>
        </div>
        
        {/* Card 4 - The Problem */}
        <div className="about-card problem-card">
          <h2 className="about-card-title">The Problem We Solve</h2>
          <p>Many people want to explore new recipes or share their culinary skills but lack a welcoming and organized space.</p>
        </div>
        
        {/* Card 5 - Our Solution */}
        <div className="about-card solution-card">
          <h2 className="about-card-title">Our Solution</h2>
          <p>HomeFlavors offers a platform where you can save your favorite recipes, follow chefs, and connect with a vibrant food community.</p>
        </div>
        
        {/* Card 6 - Join Us */}
        <div className="about-card join-card">
          <h2 className="about-card-title">Join Us</h2>
          <p>Food is better when shared. Join HomeFlavors today and let your flavors inspire the world.</p>
          <div className="about-actions">
            <button className="explore-btn" onClick={handleExploreRecipes} role="button" tabIndex="0" aria-label="Explore Recipes">Explore Recipes <span aria-hidden="true">→</span></button>
            <button className="meet-chefs-btn" onClick={handleMeetChefs} role="button" tabIndex="0" aria-label="Meet Our Chefs">Meet Our Chefs <span aria-hidden="true">→</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;