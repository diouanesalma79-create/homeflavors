import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import '../../style/HeaderActions.css';

const HeaderActions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        // Validate token with backend to ensure the session is still active
        const userData = await authService.getMe();
        setIsAuthenticated(true);
        setUser(userData);
        // Update localStorage with fresh data
        localStorage.setItem('currentUser', JSON.stringify(userData));
      } catch (err) {
        // If validation fails (e.g. 401), clear everything
        console.error('Session validation failed:', err);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('currentUser');
      }
    };

    checkAuth();
    
    // Listen for storage changes (in case user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.pathname]);

  const handleChatboxClick = () => {
    navigate('/chatbox');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        const effectiveRole = user.role === 'cook' ? 'chef' : (user.role === 'customer' ? 'visitor' : user.role);
        navigate(`/dashboard/${effectiveRole}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout failed:', err);
      // Fallback cleanup
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
    }
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  return (
    <>
  
      {/* Actions */}
      <div className="header-actions">
        {isAuthenticated && (
          <button
            type="button"
            className="header-btn header-btn--chatbox"
            onClick={handleChatboxClick}
          >
            ChatboxAI
          </button>
        )}

        {isAuthenticated ? (
          <>
            <button
              type="button"
              className="header-btn header-btn--dashboard"
              onClick={handleDashboardClick}
            >
              Profil
            </button>
            <button
              type="button"
              className="header-btn header-btn--logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            className="header-btn header-btn--login"
            onClick={handleLoginClick}
          >
            Login
          </button>
        )}
      </div>
    </>
  );
};

export default HeaderActions;
