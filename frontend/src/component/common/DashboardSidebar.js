import React from 'react';
import {
  CookingPotIcon,
  GridIcon,
  LogOutIcon,
  MessageCircleIcon,
  UserIcon
} from '../../assets/icons/Icons';
import { getChefInitial, getChefPhoto } from '../../utils/chefMarketplace';
import '../../style/ChefShared.css';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard/chef', icon: GridIcon },
  { key: 'profile', label: 'Profile', path: '/chef/profile', icon: UserIcon },
  { key: 'recipes', label: 'Recipes', path: '/chef/recipes', icon: CookingPotIcon },
  { key: 'orders', label: 'Orders', path: '/chef/orders', textIcon: 'ORD' },
  { key: 'messages', label: 'Messages', path: '/messages', icon: MessageCircleIcon },
  { key: 'settings', label: 'Settings', path: '/chef/settings', textIcon: 'SET' }
];

const DashboardSidebar = ({ user, activeItem = 'dashboard', onNavigate, onLogout }) => (
  <aside className="hf-dashboard-sidebar">
    <div className="hf-sidebar-brand">
      <span className="hf-sidebar-logo">HF</span>
      <strong>HomeFlavors</strong>
    </div>

    <div className="hf-sidebar-user">
      <div className="hf-sidebar-avatar">
        {getChefPhoto(user) ? (
          <img src={getChefPhoto(user)} alt={user?.name || 'Chef'} />
        ) : (
          <span>{getChefInitial(user)}</span>
        )}
      </div>
      <div>
        <strong>{user?.name || 'Chef'}</strong>
        <span>{user?.city || user?.address || 'Morocco'}</span>
      </div>
    </div>

    <nav className="hf-sidebar-nav" aria-label="Chef dashboard">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            className={`hf-sidebar-link ${activeItem === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.path)}
          >
            {Icon ? <Icon className="hf-sidebar-icon" /> : <span className="hf-sidebar-text-icon">{item.textIcon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>

    <button type="button" className="hf-sidebar-logout" onClick={onLogout}>
      <LogOutIcon className="hf-sidebar-icon" />
      <span>Logout</span>
    </button>
  </aside>
);

export default DashboardSidebar;
