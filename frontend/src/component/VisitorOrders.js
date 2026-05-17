import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import authService from '../services/authService';
import LoadingSpinner from './common/LoadingSpinner';
import '../style/VisitorOrders.css';

const VisitorOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const currentUser = await authService.getMe();
        if (!currentUser || currentUser.role !== 'visitor') {
          navigate('/login/visitor');
          return;
        }

        const userOrders = await orderService.getUserOrders();
        setOrders(userOrders || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching visitor orders:', err);
        setError('Failed to load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="visitor-orders-container">
        <LoadingSpinner message="Loading your orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="visitor-orders-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="visitor-orders-container">
      <div className="visitor-orders-header">
        <h2>My Orders</h2>
        <p>Track your recent purchases and their status.</p>
      </div>

      {orders.length === 0 ? (
        <div className="visitor-orders-empty">
          <p>You haven’t placed any orders yet.</p>
          <button className="visitor-orders-cta" onClick={() => navigate('/recipes')}>
            Browse recipes
          </button>
        </div>
      ) : (
        <div className="visitor-orders-list">
          {orders.map((order) => (
            <div key={order.id} className="visitor-order-card">
              <div className="visitor-order-card-top">
                <div className="visitor-order-id">Order #{order.id}</div>
                <span className={`visitor-order-status ${order.status || 'pending'}`}>
                  {(order.status || 'pending').toUpperCase()}
                </span>
              </div>

              <div className="visitor-order-body">
                <div className="visitor-order-row">
                  <span className="label">Recipe</span>
                  <span className="value">{order.recipe?.title || '—'}</span>
                </div>
                <div className="visitor-order-row">
                  <span className="label">Chef</span>
                  <span className="value">{order.recipe?.user?.name || '—'}</span>
                </div>
                <div className="visitor-order-row">
                  <span className="label">Quantity</span>
                  <span className="value">{order.quantity ?? 1}</span>
                </div>
                <div className="visitor-order-row">
                  <span className="label">Total</span>
                  <span className="value">€{order.total_price ?? 0}</span>
                </div>
                <div className="visitor-order-row">
                  <span className="label">Placed</span>
                  <span className="value">
                    {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisitorOrders;

