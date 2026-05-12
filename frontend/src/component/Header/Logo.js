import React from 'react';
import logo from '../../assets/logo/homeflavors-logo.png';
import '../../style/Logo.css';

const Logo = () => {
  return (<>
       {/* Logo + Title */}
      <div className="header-left">
        <img src={logo} alt="HomeFlavors Logo" className="header-logo" />
        <span className="header-title">HomeFlavors</span>
      </div>
      </>

  );
};

export default Logo;
