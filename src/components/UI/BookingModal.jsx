import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

export default function BookingModal() {
  const showToast = useToast();
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    plan: '',
  });

  // Expose open function globally for other components
  React.useEffect(() => {
    window.openBookingModal = (planName) => {
      if (planName) {
        // Try to match plan name to option value
        const planMap = {
          'Basic Plan': 'basic-10mb',
          'Standard Plan': 'standard-6mb',
          'Premium Plan': 'premium-10mb',
        };
        setFormData((prev) => ({ ...prev, plan: planMap[planName] || '' }));
      }
      setIsActive(true);
      document.body.style.overflow = 'hidden';
    };
    return () => {
      delete window.openBookingModal;
    };
  }, []);

  const closeModal = () => {
    setIsActive(false);
    document.body.style.overflow = '';
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isActive) closeModal();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isActive]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast("🎉 Booking request submitted! We'll contact you shortly.", 'success');
    closeModal();
    setFormData({ fullName: '', phone: '', email: '', address: '', plan: '' });
  };

  return (
    <div
      className={`modal-backdrop${isActive ? ' active' : ''}`}
      id="bookingModal"
      onClick={handleBackdropClick}
    >
      <div className="modal-content glass-card">
        <button className="modal-close" onClick={closeModal}>
          &times;
        </button>
        <h2 className="modal-title gradient-text">Book Your Connection</h2>
        <p className="modal-subtitle">Fill in your details and we'll get you connected!</p>
        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Installation Address</label>
            <textarea
              id="address"
              name="address"
              required
              placeholder="123 Main Street, City, State, ZIP"
              rows="3"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="plan">Select Plan</label>
            <select
              id="plan"
              name="plan"
              required
              value={formData.plan}
              onChange={handleChange}
            >
              <option value="">Choose a plan...</option>
              <option value="basic-10mb">Basic Plan - Polo 10MB (Rs. 3,000/month)</option>
              <option value="standard-6mb">Standard Plan - Super 6MB (Rs. 3,248/month)</option>
              <option value="standard-8mb">Standard Plan - Super 8MB (Rs. 3,800/month)</option>
              <option value="premium-10mb">Premium Plan - Super 10MB (Rs. 4,300/month)</option>
              <option value="premium-12mb">Premium Plan - Super 12MB (Rs. 4,610/month)</option>
            </select>
          </div>
          <button type="submit" className="form-submit-btn">
            Complete Booking
          </button>
        </form>
      </div>
    </div>
  );
}
