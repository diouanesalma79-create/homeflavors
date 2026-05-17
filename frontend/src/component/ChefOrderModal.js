import React, { useState } from 'react';
import orderService from '../services/orderService';
import '../style/ChefOrderModal.css';

const ChefOrderModal = ({ isOpen, onClose, dish, onConfirm }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    quantity: 1,
    note: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

    const orderData = {
      dishId: dish?.id,
      dishName: dish?.title,
      ...formData
    };

    try {
      if (onConfirm) {
        await onConfirm(orderData);
      } else {
        await orderService.placeOrder({
          recipe_id: orderData.dishId,
          quantity: orderData.quantity,
          delivery_address: orderData.address,
          notes: orderData.note,
          customer_name: orderData.fullName,
          customer_email: orderData.email,
          customer_phone: orderData.phone
        });
        alert(`Your order for "${dish?.title}" has been placed successfully!`);
      }
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        quantity: 1,
        note: ''
      });
      onClose(); // close modal after submission
    } catch (err) {
      setErrors({ submit: 'Failed to place order. Please try again.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chef-order-modal-overlay" onClick={onClose}>
      <div className="chef-order-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="chef-order-modal-header">
          <h2>Order This Dish</h2>
          <button className="chef-order-modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="chef-order-modal-body">
          {dish && (
            <div className="chef-order-modal-selected-dish">
              <p><strong>Dish:</strong> {dish.title}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="chef-order-modal-form">
            <div className="chef-order-modal-form-group">
              <label htmlFor="chefFullName">Full Name *</label>
              <input
                type="text"
                id="chefFullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? 'chef-order-modal-error' : ''}
              />
              {errors.fullName && <span className="chef-order-modal-error-message">{errors.fullName}</span>}
            </div>

            <div className="chef-order-modal-form-group">
              <label htmlFor="chefEmail">Email *</label>
              <input
                type="email"
                id="chefEmail"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'chef-order-modal-error' : ''}
              />
              {errors.email && <span className="chef-order-modal-error-message">{errors.email}</span>}
            </div>

            <div className="chef-order-modal-form-group">
              <label htmlFor="chefPhone">Phone Number *</label>
              <input
                type="tel"
                id="chefPhone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'chef-order-modal-error' : ''}
              />
              {errors.phone && <span className="chef-order-modal-error-message">{errors.phone}</span>}
            </div>

            <div className="chef-order-modal-form-group">
              <label htmlFor="chefAddress">Address *</label>
              <textarea
                id="chefAddress"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className={errors.address ? 'chef-order-modal-error' : ''}
              />
              {errors.address && <span className="chef-order-modal-error-message">{errors.address}</span>}
            </div>

            <div className="chef-order-modal-form-group">
              <label htmlFor="chefQuantity">Quantity</label>
              <input
                type="number"
                id="chefQuantity"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="chef-order-modal-form-group">
              <label htmlFor="chefNote">Notes (optional)</label>
              <textarea
                id="chefNote"
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="2"
              />
            </div>

            <div className="chef-order-modal-actions">
              <button type="button" className="chef-order-modal-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="chef-order-modal-confirm-btn">
                Confirm Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChefOrderModal;
