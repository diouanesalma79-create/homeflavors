import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import recipeService from '../services/recipeService';
import LoadingSpinner from './common/LoadingSpinner';
import '../style/Order.css';

const Order = ({ dish: initialDish }) => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState(initialDish);
  const [loading, setLoading] = useState(!initialDish && !!recipeId);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    quantity: 1,
    note: ''
  });

  const [errors, setErrors] = useState({});
  const [isOpen, setIsOpen] = useState(true); // Default to true when used as a route

  useEffect(() => {
    if (!dish && recipeId) {
      const fetchDish = async () => {
        try {
          setLoading(true);
          const data = await recipeService.getOne(recipeId);
          setDish(data);
        } catch (err) {
          console.error('Error fetching dish:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchDish();
    }
  }, [recipeId, dish]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    if (recipeId) {
      navigate(-1); // Go back if we are on the order page
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const orderData = {
        recipe_id: dish?.id,
        quantity: formData.quantity,
        delivery_address: formData.address,
        notes: formData.note,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone
      };

      await orderService.placeOrder(orderData);
      alert('Your order has been placed successfully!');
      handleClose();
    } catch (err) {
      console.error('Order error:', err);
      alert('Failed to place order. Please check your connection.');
    }
  };

  if (loading) return <LoadingSpinner message="Pre-heating the order form..." />;
  
  if (!dish && !loading && recipeId) {
    return (
      <div className="order-page">
        <div className="order-form-container">
           <span className="close-popup" onClick={() => navigate(-1)}>&times;</span>
           <h2>Dish not found</h2>
           <p>We couldn't find the recipe you're trying to order.</p>
        </div>
      </div>
    );
  }

  // If used as a component (with dish prop but NOT on the order route), we might show a button first.
  // But standard original behavior for this component when used as a route is to show the form.
  if (!isOpen && !recipeId) {
    return (
      <button
        className="view-recipes-btn"
        onClick={() => setIsOpen(true)}
      >
        Order This Dish
      </button>
    );
  }

  return (
    <div className="order-page" style={{ display: isOpen ? 'flex' : 'none' }}>
      <div className="order-form-container">
        <span
          className="close-popup"
          onClick={handleClose}
        >
          &times;
        </span>

        <h2>Order This Dish</h2>
        <p className="subtitle">
          Fresh homemade flavors, delivered to you
        </p>

        {dish && (
          <div className="selected-dish">
            <p><strong>Dish:</strong> {dish.title}</p>
            <p><strong>Price:</strong> €{dish.price}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'error' : ''}
              placeholder="Your full name"
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Your email address"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your phone number"
            />
          </div>

          <div className="form-group">
            <label>Delivery Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Where should we deliver?"
            />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Note (optional)</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="2"
              placeholder="Any special requests?"
            />
          </div>

          <button type="submit" className="submit-button">
            Confirm Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default Order;
