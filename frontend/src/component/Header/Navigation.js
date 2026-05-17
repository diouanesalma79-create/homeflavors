import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import '../../style/Navigation.css';

const ALL_NAV_ITEMS = [
  { path: '/', label: 'Home', end: true, authRequired: false },
  { path: '/recipes', label: 'Recipes', end: false, authRequired: false },
  { path: '/chefs', label: 'Chef', end: false, authRequired: true },
  { path: '/about', label: 'About', end: false, authRequired: false },
];

const Navigation = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('auth_token')
  );

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('auth_token'));
    };
    // Re-check on every route change (covers same-tab login/logout)
    syncAuth();
    // Re-check on cross-tab storage events
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, [location.pathname]);

  const visibleItems = ALL_NAV_ITEMS.filter(
    item => !item.authRequired || isAuthenticated
  );

  return (
    <nav className="main-navigation" role="navigation" aria-label="Main navigation">
      <ul className="nav-list">
        {visibleItems.map(({ path, label, end }) => (
          <li key={path} className="nav-item">
            <NavLink
              to={path}
              end={end}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;

