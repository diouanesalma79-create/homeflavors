import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import authService from '../services/authService';
import LoadingSpinner from './common/LoadingSpinner';
import '../style/ChefOrders.css';

const ChefOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getMe();
        
        if (!currentUser || (currentUser.role !== 'cook' && currentUser.role !== 'chef')) {
          navigate('/login/chef');
          return;
        }
        
        setUser(currentUser);
        const incomingOrders = await orderService.getIncomingOrders();
        
        // Map backend orders to frontend UI expectations if necessary
        const mappedOrders = (incomingOrders || []).map(order => ({
          id: order.id,
          status: order.status || 'pending',
          customerName: order.user?.name || order.customer_name || 'Guest',
          customerEmail: order.user?.email || order.customer_email || 'n/a',
          deliveryAddress: order.customer_address || 'n/a',
          date: order.created_at,
          totalAmount: order.total_price || 0,
          items: order.recipe ? [{
              id: order.recipe.id,
              name: order.recipe.title,
              price: order.recipe.price,
              quantity: order.quantity || 1
          }] : []
        }));

        setOrders(mappedOrders);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndOrders();
  }, [navigate]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order)
      );
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'in_progress') return order.status === 'accepted' || order.status === 'ready';
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="chef-orders-container">
        <LoadingSpinner message="Loading incoming orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="chef-orders-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="chef-orders-container">
      <div className="orders-header">
        <h2>My Orders</h2>
        <div className="order-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Orders
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setFilter('in_progress')}
          >
            In Progress
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet.</p>
          <p>When customers place orders for your recipes, they will appear here.</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">Order #{order.id}</div>
                <div className="order-status">
                  <span className={`status-badge ${order.status}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="order-details">
                <div className="customer-info">
                  <h4>{order.customerName}</h4>
                  <p>{order.customerEmail}</p>
                  <p>📍 {order.deliveryAddress}</p>
                </div>
                
                <div className="order-items">
                  <h5>Items:</h5>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={`${order.id}-item-${idx}`} className="order-item">
                        <span>{item.name}</span>
                        <span className="item-price">€{item.price}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="order-summary">
                  <div className="order-date">
                    <strong>Date:</strong> {new Date(order.date).toLocaleDateString()}
                  </div>
                  <div className="order-total">
                    <strong>Total:</strong> €{order.totalAmount}
                  </div>
                </div>
              </div>
              
              <div className="order-actions">
                {order.status === 'pending' && (
                  <>
                    <button 
                      className="accept-btn"
                      onClick={() => handleStatusUpdate(order.id, 'accepted')}
                    >
                      Accept Order
                    </button>
                    <button 
                      className="decline-btn"
                      onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                    >
                      Decline
                    </button>
                  </>
                )}
                
                {(order.status === 'accepted') && (
                  <button 
                    className="ready-btn"
                    onClick={() => handleStatusUpdate(order.id, 'ready')}
                  >
                    Mark as Ready
                  </button>
                )}

                {(order.status === 'ready') && (
                  <button 
                    className="complete-btn"
                    onClick={() => handleStatusUpdate(order.id, 'completed')}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChefOrders;