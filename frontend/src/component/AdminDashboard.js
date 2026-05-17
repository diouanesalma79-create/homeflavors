import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import adminService from '../services/adminService';
import '../style/AdminDashboard.css';

const orderTransitions = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const AdminIcon = ({ type }) => {
  const paths = {
    stats: (
      <>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19H2" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 19c.7-3.2 2.8-5 6-5s5.3 1.8 6 5" />
        <path d="M16 11a3 3 0 1 0 0-6" />
        <path d="M18 14c1.7.5 2.8 1.9 3.2 4" />
      </>
    ),
    chefs: (
      <>
        <path d="M6 10a4 4 0 0 1 7-2.6A3.5 3.5 0 0 1 19 10" />
        <path d="M5 10h14l-1 9H6z" />
        <path d="M8 14h8" />
      </>
    ),
    recipes: (
      <>
        <path d="M7 3h8l4 4v14H7z" />
        <path d="M15 3v5h5" />
        <path d="M10 12h6" />
        <path d="M10 16h6" />
      </>
    ),
    orders: (
      <>
        <path d="M6 8h12l-1 12H7z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
        <path d="M9 13h6" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="admin-icon">
      {paths[type]}
    </svg>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [approvedRecipes, setApprovedRecipes] = useState([]);
  const [rejectedRecipes, setRejectedRecipes] = useState([]);
  const [pendingChefs, setPendingChefs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refreshStats = useCallback(async () => {
    const data = await adminService.getStats();
    setStats(data || null);
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [recipes, chefs, statData, adminOrders] = await Promise.all([
        adminService.getPendingRecipes(),
        adminService.getPendingChefs(),
        adminService.getStats(),
        adminService.getOrders(),
      ]);

      setPendingRecipes(recipes || []);
      setPendingChefs(chefs || []);
      setStats(statData || null);
      setOrders(adminOrders || []);
      setError('');
    } catch (err) {
      setError('Failed to load admin dashboard data. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const currentUser = await authService.getMe();
        if (!currentUser || currentUser.role !== 'admin') {
          navigate('/login');
          return;
        }
        fetchDashboard();
      } catch (err) {
        navigate('/login');
      }
    };
    checkAdminAccess();
  }, [navigate, fetchDashboard]);

  const showNotice = (message) => {
    setNotice(message);
    setError('');
  };

  const handleApprove = async (recipe) => {
    try {
      setActionLoading(`recipe-${recipe.id}`);
      const updated = await adminService.approveRecipe(recipe.id);
      setPendingRecipes(prev => prev.filter(r => r.id !== recipe.id));
      setApprovedRecipes(prev => [updated || { ...recipe, status: 'approved' }, ...prev]);
      await refreshStats();
      showNotice('Recipe approved.');
    } catch (err) {
      setError('Failed to approve recipe.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (recipe) => {
    try {
      setActionLoading(`recipe-${recipe.id}`);
      const updated = await adminService.rejectRecipe(recipe.id);
      setPendingRecipes(prev => prev.filter(r => r.id !== recipe.id));
      setRejectedRecipes(prev => [updated || { ...recipe, status: 'rejected' }, ...prev]);
      await refreshStats();
      showNotice('Recipe rejected.');
    } catch (err) {
      setError('Failed to reject recipe.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChefAction = async (chef, action) => {
    try {
      setActionLoading(`chef-${chef.id}`);
      if (action === 'approve') {
        await adminService.approveChef(chef.id);
        showNotice('Chef approved.');
      } else {
        await adminService.rejectChef(chef.id);
        showNotice('Chef rejected.');
      }
      setPendingChefs(prev => prev.filter(item => item.id !== chef.id));
      await refreshStats();
    } catch (err) {
      setError(`Failed to ${action} chef.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserSearch = async (event) => {
    event.preventDefault();
    const query = userSearch.trim();

    if (query.length < 2) {
      setError('Search by at least two characters.');
      return;
    }

    try {
      setSearchingUsers(true);
      const users = await adminService.searchUsers(query);
      setUserResults(users || []);
      setError('');
    } catch (err) {
      setError('Failed to search users.');
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleUserAction = async (action) => {
    if (!selectedUser) {
      setError('Select a user first.');
      return;
    }

    try {
      setActionLoading(`user-${selectedUser.id}`);
      const updatedStatus = action === 'ban' ? 'inactive' : 'active';
      let updated;
      if (action === 'ban') {
        updated = await adminService.banUser(selectedUser.id);
        showNotice('User banned.');
      } else {
        updated = await adminService.unbanUser(selectedUser.id);
        showNotice('User unbanned.');
      }

      const nextUser = updated || { ...selectedUser, status: updatedStatus };
      setSelectedUser(nextUser);
      setUserResults(prev => prev.map(user => user.id === selectedUser.id ? nextUser : user));
      await refreshStats();
    } catch (err) {
      setError(`Failed to ${action} user.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOrderStatus = async (order, status) => {
    try {
      setActionLoading(`order-${order.id}`);
      const updated = await adminService.updateOrderStatus(order.id, status);
      setOrders(prev => prev.map(item => item.id === order.id ? (updated || { ...item, status }) : item));
      await refreshStats();
      showNotice('Order status updated.');
    } catch (err) {
      setError('Failed to update order status.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

  const formatLabel = (value) => String(value || 'pending')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

  const formatRole = (role) => role === 'cook' ? 'Chef' : formatLabel(role);

  const statusBadge = (status) => {
    const safeStatus = status || 'pending';
    return (
      <span className={`status-badge status-${safeStatus}`}>
        {formatLabel(safeStatus)}
      </span>
    );
  };

  const emptyState = (message) => (
    <div className="admin-empty-state">{message}</div>
  );

  const renderStatCards = () => {
    const statCards = [
      {
        label: 'Users',
        value: stats?.users?.total,
        detail: `${stats?.users?.active || 0} active`,
      },
      {
        label: 'Chefs',
        value: stats?.chefs?.total,
        detail: `${stats?.chefs?.pending || 0} pending`,
      },
      {
        label: 'Recipes',
        value: stats?.recipes?.total,
        detail: `${stats?.recipes?.pending || 0} pending`,
      },
      {
        label: 'Orders',
        value: stats?.orders?.total,
        detail: `${stats?.orders?.pending || 0} pending`,
      },
    ];

    return (
      <div className="admin-stats-row-v4">
        {statCards.map(card => (
          <div className="admin-stat-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value ?? '-'}</strong>
            <small>{card.detail}</small>
          </div>
        ))}
      </div>
    );
  };

  const renderStats = () => (
    <section className="admin-section-card">
      <div className="admin-section-head">
        <div>
          <span className="admin-eyebrow">Overview</span>
          <h2>Stats Overview</h2>
        </div>
      </div>
      {renderStatCards()}
      <div className="admin-work-grid">
        <button type="button" className="admin-work-card" onClick={() => setActiveTab('users')}>
          <span>User Access</span>
          <strong>{stats?.users?.active || 0}</strong>
          <small>Ban / unban</small>
        </button>
        <button type="button" className="admin-work-card" onClick={() => setActiveTab('chefs')}>
          <span>Chef Reviews</span>
          <strong>{pendingChefs.length}</strong>
          <small>Approve / reject</small>
        </button>
        <button type="button" className="admin-work-card" onClick={() => setActiveTab('recipes')}>
          <span>Recipe Reviews</span>
          <strong>{pendingRecipes.length}</strong>
          <small>Approve / reject</small>
        </button>
        <button type="button" className="admin-work-card" onClick={() => setActiveTab('orders')}>
          <span>Orders</span>
          <strong>{orders.length}</strong>
          <small>Status updates</small>
        </button>
      </div>
    </section>
  );

  const renderUsers = () => (
    <section className="admin-section-card">
      <div className="admin-section-head">
        <div>
          <span className="admin-eyebrow">Access</span>
          <h2>Users Management</h2>
          <p>Search by name or email, then update access.</p>
        </div>
        <span className="admin-count">{stats?.users?.total || 0} total</span>
      </div>

      <form className="admin-user-actions" onSubmit={handleUserSearch}>
        <label className="admin-field">
          <span>Find User</span>
          <input
            type="search"
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            placeholder="Name or email"
          />
        </label>
        <button type="submit" className="admin-search-btn" disabled={searchingUsers}>
          {searchingUsers ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="users-grid">
        {userResults.length === 0 ? emptyState('Search for a user to manage access.') : userResults.map(user => (
          <button
            type="button"
            key={user.id}
            className={`user-card admin-user-card ${selectedUser?.id === user.id ? 'selected' : ''}`}
            onClick={() => setSelectedUser(user)}
          >
            <div className="user-card-header">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="user-avatar" />
              ) : (
                <div className="user-avatar-placeholder">{user.name?.charAt(0) || 'U'}</div>
              )}
              <div className="user-info">
                <h3 className="user-name">{user.name}</h3>
                <p className="user-email">{user.email}</p>
                <p className="user-role">{formatRole(user.role)}</p>
                {statusBadge(user.status || 'active')}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedUser && (
        <div className="admin-selected-user">
          <div>
            <span className="admin-eyebrow">Selected User</span>
            <h3>{selectedUser.name}</h3>
            <p>{selectedUser.email}</p>
          </div>
        <div className="approval-buttons">
          <button
            type="button"
            className="reject-btn"
              disabled={actionLoading === `user-${selectedUser.id}`}
            onClick={() => handleUserAction('ban')}
          >
              {actionLoading === `user-${selectedUser.id}` ? 'Saving...' : 'Ban User'}
          </button>
          <button
            type="button"
            className="approve-btn"
              disabled={actionLoading === `user-${selectedUser.id}`}
            onClick={() => handleUserAction('unban')}
          >
              {actionLoading === `user-${selectedUser.id}` ? 'Saving...' : 'Unban User'}
          </button>
        </div>
      </div>
      )}
    </section>
  );

  const renderRecipeCards = (recipes, showActions = false) => {
    if (recipes.length === 0) {
      return emptyState('No recipes found.');
    }

    return recipes.map(recipe => (
      <div key={recipe.id} className="user-card">
        <div className="user-card-header">
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.title} className="user-avatar recipe-avatar" />
          ) : (
            <div className="user-avatar-placeholder">{recipe.title?.charAt(0) || 'R'}</div>
          )}
          <div className="user-info">
            <h3 className="user-name">{recipe.title}</h3>
            <p className="user-email">By {recipe.chefName || 'Unknown Chef'}</p>
            <p className="user-role">{recipe.category || 'Uncategorized'}</p>
            <p className="user-role">{formatCurrency(recipe.price)}</p>
            <p className="registration-date">Submitted: {formatDate(recipe.created_at)}</p>
            {statusBadge(recipe.status)}
          </div>
        </div>

        {showActions && (
          <div className="approval-buttons">
            <button
              type="button"
              className="approve-btn"
              disabled={actionLoading === `recipe-${recipe.id}`}
              onClick={() => handleApprove(recipe)}
            >
              {actionLoading === `recipe-${recipe.id}` ? 'Saving...' : 'Approve'}
            </button>
            <button
              type="button"
              className="reject-btn"
              disabled={actionLoading === `recipe-${recipe.id}`}
              onClick={() => handleReject(recipe)}
            >
              {actionLoading === `recipe-${recipe.id}` ? 'Saving...' : 'Reject'}
            </button>
          </div>
        )}
      </div>
    ));
  };

  const renderChefs = () => (
    <section className="admin-section-card">
      <div className="admin-section-head">
        <div>
          <span className="admin-eyebrow">Approvals</span>
          <h2>Chefs Approval</h2>
          <p>Review pending chef accounts.</p>
        </div>
        <span className="admin-count">{pendingChefs.length} pending</span>
      </div>
      <div className="users-grid">
        {pendingChefs.length === 0 ? emptyState('No pending chefs.') : pendingChefs.map(chef => (
          <div key={chef.id} className="user-card">
            <div className="user-card-header">
              {chef.profilePhoto || chef.profile_picture_url ? (
                <img
                  src={chef.profilePhoto || chef.profile_picture_url}
                  alt={chef.name}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-placeholder">{chef.name?.charAt(0) || 'C'}</div>
              )}
              <div className="user-info">
                <h3 className="user-name">{chef.name}</h3>
                <p className="user-email">{chef.email}</p>
                <p className="user-role">{formatRole(chef.role)}</p>
                <p className="registration-date">Joined: {formatDate(chef.created_at)}</p>
                {statusBadge(chef.status)}
              </div>
            </div>
            <div className="approval-buttons">
              <button
                type="button"
                className="approve-btn"
                disabled={actionLoading === `chef-${chef.id}`}
                onClick={() => handleChefAction(chef, 'approve')}
              >
                {actionLoading === `chef-${chef.id}` ? 'Saving...' : 'Approve'}
              </button>
              <button
                type="button"
                className="reject-btn"
                disabled={actionLoading === `chef-${chef.id}`}
                onClick={() => handleChefAction(chef, 'reject')}
              >
                {actionLoading === `chef-${chef.id}` ? 'Saving...' : 'Reject'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderRecipes = () => (
    <section className="admin-section-card">
      <div className="admin-section-head">
        <div>
          <span className="admin-eyebrow">Approvals</span>
          <h2>Recipes Approval</h2>
          <p>Review pending recipe submissions.</p>
        </div>
        <span className="admin-count">{pendingRecipes.length} pending</span>
      </div>
      <div className="users-grid">
        {renderRecipeCards(pendingRecipes, true)}
      </div>
      {(approvedRecipes.length > 0 || rejectedRecipes.length > 0) && (
        <div className="admin-session-grid">
          {approvedRecipes.length > 0 && (
            <div>
              <h3>Approved This Session</h3>
              <div className="users-grid compact-grid">{renderRecipeCards(approvedRecipes)}</div>
            </div>
          )}
          {rejectedRecipes.length > 0 && (
            <div>
              <h3>Rejected This Session</h3>
              <div className="users-grid compact-grid">{renderRecipeCards(rejectedRecipes)}</div>
            </div>
          )}
        </div>
      )}
    </section>
  );

  const renderOrders = () => (
    <section className="admin-section-card">
      <div className="admin-section-head">
        <div>
          <span className="admin-eyebrow">Fulfillment</span>
          <h2>Orders Management</h2>
          <p>Update order status.</p>
        </div>
        <span className="admin-count">{orders.length} total</span>
      </div>
      <div className="admin-orders-list">
        {orders.length === 0 ? emptyState('No orders found.') : orders.map(order => {
          const nextStatuses = orderTransitions[order.status] || [];
          return (
            <div key={order.id} className="admin-order-card">
              <div className="admin-order-top">
                <div>
                  <span className="admin-eyebrow">Order #{order.id}</span>
                  <h3>{order.items?.[0]?.name || 'Order'}</h3>
                </div>
                {statusBadge(order.status)}
              </div>
              <div className="admin-order-details">
                <span>{order.customerName || 'Unknown customer'}</span>
                <span>{order.customerEmail || 'No email'}</span>
                <span>{formatDate(order.date)}</span>
                <strong>{formatCurrency(order.totalAmount)}</strong>
              </div>
              <div className="admin-order-items">
                {(order.items || []).map((item, index) => (
                  <div key={`${order.id}-${item.id || index}`}>
                    <span>{item.name}</span>
                    <small>Qty {item.quantity}</small>
                  </div>
                ))}
              </div>
              <div className="approval-buttons">
                {nextStatuses.length === 0 ? (
                  <span className="admin-muted">No further updates</span>
                ) : nextStatuses.map(nextStatus => (
                  <button
                    type="button"
                    key={nextStatus}
                    className={nextStatus === 'cancelled' ? 'reject-btn' : 'approve-btn'}
                    disabled={actionLoading === `order-${order.id}`}
                    onClick={() => handleOrderStatus(order, nextStatus)}
                  >
                    {actionLoading === `order-${order.id}` ? 'Saving...' : `Mark ${formatLabel(nextStatus)}`}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  const navItems = [
    { id: 'stats', label: 'Stats', icon: 'stats' },
    { id: 'users', label: 'Users', icon: 'users' },
    { id: 'chefs', label: 'Chefs', icon: 'chefs', count: pendingChefs.length },
    { id: 'recipes', label: 'Recipes', icon: 'recipes', count: pendingRecipes.length },
    { id: 'orders', label: 'Orders', icon: 'orders', count: orders.length },
  ];

  if (loading) return (
    <div className="admin-dashboard-wrapper">
      <main className="admin-loading-shell">
        <h1>Admin Dashboard</h1>
        <p>Manage HomeFlavors activity from one clean workspace.</p>
      <div className="loading">Loading dashboard...</div>
      </main>
    </div>
  );

  return (
    <div className="admin-dashboard-wrapper">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">
              <AdminIcon type="stats" />
            </span>
            <span>HomeFlavors</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Admin sections">
          {navItems.map(item => (
          <button
            type="button"
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
          >
              <AdminIcon type={item.icon} />
              <span>{item.label}</span>
              {typeof item.count === 'number' && <small>{item.count}</small>}
          </button>
        ))}
        </nav>
      </aside>

      <main className="admin-main-content">
        <section className="admin-hero-elegant">
          <div>
            <span className="admin-eyebrow">HomeFlavors Admin</span>
            <h1>Admin Dashboard</h1>
            <p>Manage users, chefs, recipes, orders, and stats from one warm workspace.</p>
          </div>
          <div className="admin-hero-badges">
            <span>{pendingChefs.length} chefs pending</span>
            <span>{pendingRecipes.length} recipes pending</span>
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}
        {notice && <div className="success-message">{notice}</div>}

        {activeTab === 'stats' && renderStats()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'chefs' && renderChefs()}
        {activeTab === 'recipes' && renderRecipes()}
        {activeTab === 'orders' && renderOrders()}
      </main>
    </div>
  );
};

export default AdminDashboard;
