import React, { useState } from 'react';
import Logo from './Header/Logo';
import Navigation from './Header/Navigation';
import HeaderActions from './Header/HeaderActions';
import MobileMenu from './Header/MobileMenu';
import '../style/Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header" role="banner">
      <div className="header-container">
        <div className="header-left">
          <Logo />
        </div>

        <div className="header-center">
          <Navigation />
        </div>

        <div className="header-right">
          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className="hamburger">☰</span>
          </div>
          <HeaderActions />
        </div>
      </div>
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={closeMobileMenu} 
      />
    </header>
  );
};

export default Header;