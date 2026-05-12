// Professional SVG Icons Component
// Based on Lucide/Heroicons design system
import React from 'react';

const iconStyle = {
  width: '1em',          // IMPORTANT : taille contrôlée par CSS
  height: '1em',
  stroke: 'currentColor',
  fill: 'none',
  strokeWidth: 2
};

export const HomeIcon = ({ className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    style={iconStyle}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const BookOpenIcon = ({ className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    style={iconStyle}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const ChefHatIcon = ({ className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    style={iconStyle}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z" />
    <line x1="6" y1="17" x2="18" y2="17" />
  </svg>
);

export const MessageCircleIcon = ({ className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    style={iconStyle}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const UserIcon = ({ className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    style={iconStyle}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const LogOutIcon = ({ className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    style={iconStyle}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const CookingPotIcon = ({ className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    style={iconStyle}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path d="M2 12h20" />
    <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
    <path d="M6 12V6a2 2 0 0 1 2-2h3" />
    <path d="M18 12V6a2 2 0 0 0-2-2h-3" />
    <path d="M12 2v4" />
  </svg>
);

export const GridIcon = ({ className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    style={iconStyle}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

export const UsersIcon = ({ className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    style={iconStyle}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
// Icons.jsx


export const MailIcon = ({ className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    style={iconStyle}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 7L2 7" />
  </svg>
);

export const PhoneIcon = ({ className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    style={iconStyle}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const MapPinIcon = ({ className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    style={iconStyle}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

