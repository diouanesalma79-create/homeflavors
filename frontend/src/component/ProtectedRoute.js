import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const storedUser = localStorage.getItem('currentUser');
  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error('Error parsing user from localStorage:', err);
    localStorage.removeItem('currentUser'); // Clean up bad data
    return <Navigate to="/login" replace />;
  }

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const effectiveRole = user.role === 'cook' ? 'chef' : (user.role === 'customer' ? 'visitor' : user.role);
    return <Navigate to={`/dashboard/${effectiveRole}`} replace />;
  }

  return children;
};

export default ProtectedRoute;