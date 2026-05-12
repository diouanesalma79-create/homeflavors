import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import authService from '../services/authService';
import profileService from '../services/profileService';
import recipeService from '../services/recipeService';
import dashboardService from '../services/dashboardService';
import LoadingSpinner from './common/LoadingSpinner';
import '../style/Dashboard.css';
import '../style/ChefDashboard.css';

// Import SVG icons
import { GridIcon, CookingPotIcon, MessageCircleIcon, UserIcon, LogOutIcon } from '../assets/icons/Icons';

const getFlagEmoji = (nationality) => {
  const flags = {
    'Spanish': '🇪🇸', 'Italian': '🇮🇹', 'French': '🇫🇷', 'Mexican': '🇲🇽',
    'Indian': '🇮🇳', 'Chinese': '🇨🇳', 'Japanese': '🇯🇵', 'Thai': '🇹🇭',
    'Moroccan': '🇲🇦', 'Greek': '🇬🇷', 'Turkish': '🇹🇷', 'Lebanese': '🇱🇧',
    'American': '🇺🇸', 'British': '🇬🇧'
  };
  return flags[nationality] || '🌍';
};

const Dashboard = () => {
  const { userType } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await authService.getMe();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        const effectiveRole = currentUser.role === 'cook' ? 'chef' : (currentUser.role === 'customer' ? 'visitor' : (currentUser.role === 'admin' ? 'admin' : currentUser.role));
        if (userType && userType !== effectiveRole) {
          navigate(`/dashboard/${effectiveRole}`);
          return;
        }
        setUser(currentUser);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [userType, navigate]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  if (loading) return <LoadingSpinner message="Preparing your kitchen..." />;
  if (!user) return null;

  return (
    <div className={user.role === 'cook' ? 'chef-dashboard-wrapper' : 'visitor-dashboard-container'}>
      {user.role === 'cook' ? (
        <ChefDashboard user={user} onLogout={handleLogout} navigate={navigate} />
      ) : (
        <VisitorDashboardContent user={user} navigate={navigate} onLogout={handleLogout} />
      )}
    </div>
  );
};

// --- ELEGANT CHEF DASHBOARD V4 (MINIMAL & RICH) ---
const ChefDashboard = ({ user, onLogout, navigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getChefStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const renderSidebar = () => (
    <aside className="chef-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">HF</div>
          <span>HomeFlavors</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link to="/dashboard/chef" className="sidebar-nav-item active">
          <GridIcon />
          <span>Dashboard</span>
        </Link>
        <Link to="/chef/recipes" className="sidebar-nav-item">
          <CookingPotIcon />
          <span>My Menu</span>
        </Link>
        <Link to="/chef/orders" className="sidebar-nav-item">
          <span style={{fontSize: '1.2rem', lineHeight: 1}}>📋</span>
          <span>Orders</span>
        </Link>
        <Link to="/messages" className="sidebar-nav-item">
          <MessageCircleIcon />
          <span>Messages</span>
        </Link>
        <Link to="/profile-settings" className="sidebar-nav-item">
          <span style={{fontSize: '1.2rem', lineHeight: 1}}>⚙️</span>
          <span>Settings</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <LogOutIcon />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  if (loading) return <LoadingSpinner message="Refining your dashboard..." />;

  return (
    <div style={{display: 'flex', width: '100%'}}>
      {renderSidebar()}
      
      <main className="chef-main-content">
        
        {/* 1. SIMPLIFIED LUXURY HERO */}
        <section className="chef-hero-elegant">
          <div className="hero-avatar-box">
            <div className="avatar-premium-v4">
              {user.profile_picture_url ? (
                <img src={user.profile_picture_url} alt={user.name} style={{width:'100%', height:'100%', borderRadius:'50%'}} />
              ) : (
                <div className="fallback">{user.name?.charAt(0)}</div>
              )}
            </div>
            <div className="verified-ring">✓</div>
          </div>
          
          <div className="hero-text-box">
            <div className="hero-tag-line">
              <span>{getFlagEmoji(user.nationality)} {user.nationality || 'Chef'}</span>
              <span>•</span>
              <span>{user.specialty || 'Professional Chef'}</span>
              <span className="rating-badge-v4">⭐ {stats?.averageRating || '4.8'}</span>
            </div>
            <h1>{user.name}</h1>
            <p className="hero-bio-v4">
              {user.bio || "Sharing my culinary passion through authentic recipes and premium ingredients. Welcome to my professional space."}
            </p>
            <div className="hero-btns-v4">
              <button className="btn-v4 btn-v4-primary" onClick={() => navigate('/dashboard/chef/recettes/nouvelle')}>
                <span>+</span> Add Recipe
              </button>
            </div>
          </div>
        </section>

        {/* 2. COMPACT STATS ROW */}
        <section className="chef-stats-row-v4">
          <div className="stat-card-v4">
            <div className="stat-icon-v4">🍳</div>
            <div className="stat-info-v4">
              <h4>Recipes</h4>
              <span className="val">{stats?.totalRecipes || 0}</span>
            </div>
          </div>
          <div className="stat-card-v4" onClick={() => navigate('/chef/orders')} style={{cursor: 'pointer'}}>
            <div className="stat-icon-v4">📋</div>
            <div className="stat-info-v4">
              <h4>Orders</h4>
              <span className="val">{stats?.pendingOrders || 0}</span>
            </div>
          </div>
          <div className="stat-card-v4" onClick={() => navigate('/messages')} style={{cursor: 'pointer'}}>
            <div className="stat-icon-v4">💬</div>
            <div className="stat-info-v4">
              <h4>Messages</h4>
              <span className="val">{stats?.unreadMessages || 0}</span>
            </div>
          </div>
          <div className="stat-card-v4">
            <div className="stat-icon-v4">⭐</div>
            <div className="stat-info-v4">
              <h4>Rating</h4>
              <span className="val">{stats?.averageRating || '4.8'}</span>
            </div>
          </div>
        </section>

        {/* 3. ELEGANT CONTENT GRID */}
        <section className="dashboard-content-v4">
          
          {/* Left: Recipes */}
          <div className="left-col-v4">
            <div className="section-head-v4">
              <h2>Recent Recipes</h2>
              <Link to="/chef/recipes" className="link-v4">View All Menu →</Link>
            </div>
            <div className="recipe-grid-v4">
              {stats?.recentRecipes?.length > 0 ? (
                stats.recentRecipes.map(recipe => (
                  <div key={recipe.id} className="recipe-card-v4" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                    <div className="r-img-box">
                      <img src={recipe.image} alt={recipe.title} />
                    </div>
                    <div className="r-info-box">
                      <span className="r-cat">{recipe.category}</span>
                      <h3>{recipe.title}</h3>
                      <div className="r-stats-v4">
                        <span>❤️ {recipe.likes}</span>
                        <span>⭐ {recipe.rating || '4.8'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="stat-card-v4" style={{gridColumn: 'span 2', padding:'4rem', textAlign:'center', display:'block'}}>
                   <p style={{color: 'var(--text-muted)'}}>No recipes yet. Share your first culinary masterpiece.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Side Panel (Orders & Messages) */}
          <div className="side-panel-v4">
            <div className="orders-section-v4">
              <div className="section-head-v4">
                <h2>New Orders</h2>
              </div>
              <div className="orders-list-v4">
                {stats?.recentActivity?.filter(a => a.type === 'order').length > 0 ? (
                  stats.recentActivity.filter(a => a.type === 'order').slice(0, 3).map((order, idx) => (
                    <div key={idx} className="order-item-v4">
                      <div>
                        <span className="m-name-v4">{order.title}</span>
                        <span className="m-text-v4">{order.subtitle}</span>
                      </div>
                      <span className="order-badge-v4 badge-pending">Pending</span>
                    </div>
                  ))
                ) : (
                  <p style={{color: 'var(--text-muted)', fontSize:'0.9rem'}}>No pending orders.</p>
                )}
              </div>
            </div>

            <div className="messages-section-v4">
              <div className="section-head-v4">
                <h2>Direct Messages</h2>
                <Link to="/messages" className="link-v4">Inbox →</Link>
              </div>
              <div className="msg-list-v4">
                {stats?.recentMessages?.length > 0 ? (
                  stats.recentMessages.map((msg, idx) => (
                    <Link key={idx} to="/messages" className="msg-item-v4">
                      {msg.partnerPhoto ? (
                        <img src={msg.partnerPhoto} alt={msg.partnerName} className="m-ava-v4" />
                      ) : (
                        <div className="m-ava-v4" style={{display:'flex', alignItems:'center', justifyContent:'center', background:'var(--primary-soft)', color:'var(--primary)', fontWeight:'800'}}>
                          {msg.partnerName?.charAt(0)}
                        </div>
                      )}
                      <div className="m-details-v4">
                        <span className="m-name-v4">{msg.partnerName}</span>
                        <span className="m-text-v4">{msg.lastMessage}</span>
                      </div>
                      {msg.isUnread && <div className="m-dot-v4"></div>}
                    </Link>
                  ))
                ) : (
                  <p style={{color: 'var(--text-muted)', fontSize:'0.9rem'}}>No new messages.</p>
                )}
              </div>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
};

// --- VISITOR DASHBOARD CONTENT (STABLE) ---
const VisitorDashboardContent = ({ user, navigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('saved');
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    const fetchSaved = async () => {
        try {
            const data = await recipeService.getFavorites();
            setSavedRecipes(data || []);
        } catch (err) {
            console.error(err);
        }
    };
    fetchSaved();
  }, []);

  return (
    <div style={{width: '100%'}}>
      <div className="visitor-dashboard-header">
        <div className="visitor-cover-image"></div>
        <div className="visitor-profile-info">
          <div className="visitor-profile-info-content">
            <div className="visitor-avatar-container">
              <div className={user.profilePhoto ? "visitor-avatar visitor-image-avatar" : "visitor-avatar visitor-fallback-avatar"}>
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                ) : (
                  <span>{user.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="visitor-profile-badge">✓</div>
            </div>
            <div className="visitor-profile-details">
              <h1 className="visitor-profile-name">Welcome back, {user.name}!</h1>
              <p className="visitor-profile-role"><span>Role: Food Enthusiast</span></p>
            </div>
          </div>
        </div>
      </div>
      <div className="visitor-dashboard-actions">
        <button className="visitor-profile-btn" onClick={() => navigate('/profile-settings')}>Profile Settings</button>
        <button className="visitor-logout-btn" onClick={onLogout}>Logout</button>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-tabs">
          <button className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>Saved Recipes</button>
          <button className={`tab-button ${activeTab === 'other' ? 'active' : ''}`} onClick={() => setActiveTab('other')}>Others</button>
        </div>
        {activeTab === 'saved' ? (
          <div className="saved-recipes-container">
            <div className="saved-recipes-grid">
              {savedRecipes.length > 0 ? savedRecipes.map(recipe => (
                <div key={recipe.id} className="saved-recipe-card">
                  <img src={recipe.image} alt={recipe.title} className="saved-recipe-image" />
                  <div className="saved-recipe-info">
                    <h3 className="saved-recipe-title">{recipe.title}</h3>
                    <p className="saved-recipe-meta">By {recipe.chefName} • {recipe.category}</p>
                  </div>
                  <div className="saved-recipe-actions">
                    <button className="view-recipe-btn" onClick={() => navigate(`/recipe/${recipe.id}`)}>View Recipe</button>
                    <button className="remove-recipe-btn">Remove</button>
                  </div>
                </div>
              )) : <p>No saved recipes yet.</p>}
            </div>
          </div>
        ) : (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-icon">💬</div>
              <div className="card-content">
                <h3 className="card-title">Messages</h3>
                <p>Connect with chefs and others</p>
                <button className="card-action-btn" onClick={() => navigate('/messages')}>View Messages</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;