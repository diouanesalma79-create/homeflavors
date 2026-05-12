import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import adminService from '../services/adminService';
import '../style/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingRecipes, setPendingRecipes]   = useState([]);
  const [approvedRecipes, setApprovedRecipes] = useState([]);
  const [rejectedRecipes, setRejectedRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading]     = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // recipe id being actioned
  const [error, setError]         = useState('');

  // ── fetch pending from API, approved/rejected tracked locally ──
  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingRecipes();
      setPendingRecipes(data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch pending recipes. Make sure you are logged in as admin.');
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
        fetchPending();
      } catch (err) {
        navigate('/login');
      }
    };
    checkAdminAccess();
  }, [navigate, fetchPending]);

  const handleApprove = async (recipe) => {
    try {
      setActionLoading(recipe.id);
      const updated = await adminService.approveRecipe(recipe.id);
      setPendingRecipes(prev => prev.filter(r => r.id !== recipe.id));
      setApprovedRecipes(prev => [updated || { ...recipe, status: 'approved' }, ...prev]);
    } catch (err) {
      setError('Failed to approve recipe.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (recipe) => {
    try {
      setActionLoading(recipe.id);
      const updated = await adminService.rejectRecipe(recipe.id);
      setPendingRecipes(prev => prev.filter(r => r.id !== recipe.id));
      setRejectedRecipes(prev => [updated || { ...recipe, status: 'rejected' }, ...prev]);
    } catch (err) {
      setError('Failed to reject recipe.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const statusBadge = (status) => {
    const cls =
      status === 'approved' ? 'status-approved' :
      status === 'rejected' ? 'status-rejected' : 'status-pending';
    return <span className={`status-badge ${cls}`}>{status}</span>;
  };

  const renderRecipeCards = (recipes, showActions = false) => {
    if (recipes.length === 0) {
      return <p className="no-users">No recipes found in this category.</p>;
    }
    return recipes.map(recipe => (
      <div key={recipe.id} className="user-card">
        <div className="user-card-header">
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.title} className="user-avatar" style={{ objectFit: 'cover', borderRadius: '8px' }} />
          ) : (
            <div className="user-avatar-placeholder">🍽️</div>
          )}
          <div className="user-info">
            <h3 className="user-name">{recipe.title}</h3>
            <p className="user-email">By: {recipe.chefName || 'Unknown Chef'}</p>
            <p className="user-role">Category: {recipe.category || 'N/A'}</p>
            <p className="user-role">Price: ${parseFloat(recipe.price || 0).toFixed(2)}</p>
            <p className="registration-date">Submitted: {formatDate(recipe.created_at)}</p>
            {statusBadge(recipe.status)}
          </div>
        </div>

        {showActions && (
          <div className="approval-buttons">
            <button
              className="approve-btn"
              disabled={actionLoading === recipe.id}
              onClick={() => handleApprove(recipe)}
            >
              {actionLoading === recipe.id ? '⏳' : '✅'} Approve
            </button>
            <button
              className="reject-btn"
              disabled={actionLoading === recipe.id}
              onClick={() => handleReject(recipe)}
            >
              {actionLoading === recipe.id ? '⏳' : '❌'} Reject
            </button>
          </div>
        )}
      </div>
    ));
  };

  if (loading) return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Review and approve chef recipe submissions</p>
      </div>
      <div className="loading">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Review and approve chef recipe submissions</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingRecipes.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved ({approvedRecipes.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected ({rejectedRecipes.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'pending' && (
          <div className="users-section">
            <h2>Pending Recipes</h2>
            <div className="users-grid">
              {renderRecipeCards(pendingRecipes, true)}
            </div>
          </div>
        )}
        {activeTab === 'approved' && (
          <div className="users-section">
            <h2>Approved Recipes</h2>
            <div className="users-grid">
              {renderRecipeCards(approvedRecipes, false)}
            </div>
          </div>
        )}
        {activeTab === 'rejected' && (
          <div className="users-section">
            <h2>Rejected Recipes</h2>
            <div className="users-grid">
              {renderRecipeCards(rejectedRecipes, false)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;