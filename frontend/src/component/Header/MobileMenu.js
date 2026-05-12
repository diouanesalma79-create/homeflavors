import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../style/MobileMenu.css';

const MobileMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleChatboxClick = () => {
    navigate('/chatbox');
    onClose();
  };

  const handleLoginClick = () => {
    navigate('/login');
    onClose();
  };

  const handleDashboardClick = () => {
    if (user) {
      navigate(`/dashboard/${user.role}`);
    }
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setUser(null);
    onClose();
    navigate('/');
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-header">
          <button className="mobile-menu-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <nav className="mobile-navigation">
          <ul className="mobile-nav-list">
            <li className="mobile-nav-item">
              <Link to="/" className="mobile-nav-link" onClick={onClose}>
                Accueil
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/recipes" className="mobile-nav-link" onClick={onClose}>
                Recettes
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/chefs" className="mobile-nav-link" onClick={onClose}>
                Chefs
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/about" className="mobile-nav-link" onClick={onClose}>
                About
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mobile-menu-actions">
          {!isAuthenticated && (
            <button
              type="button"
              className="mobile-menu-btn mobile-menu-btn--chatbox"
              onClick={handleChatboxClick}
            >
              ChatboxAI
            </button>
          )}

          {isAuthenticated ? (
            <>
              <button
                type="button"
                className="mobile-menu-btn mobile-menu-btn--dashboard"
                onClick={handleDashboardClick}
              >
                Profil
              </button>
              <button
                type="button"
                className="mobile-menu-btn mobile-menu-btn--logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              className="mobile-menu-btn mobile-menu-btn--login"
              onClick={handleLoginClick}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;