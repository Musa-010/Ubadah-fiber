import React, { useState, useRef } from 'react';
import useFormValidation from '../../hooks/useFormValidation';
import { addBooking } from '../../firebase/firebaseService';

export default function BookNow() {
  const { errors, validateField, clearError, validateAll } = useFormValidation();
  const formRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    package: '',
    address: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Real-time filtering
    if (name === 'fullName') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }
    if (name === 'phone') {
      value = value.replace(/[^0-9]/g, '');
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    clearError(name);

    // Phone digit counter
    if (name === 'phone' && value.length > 0) {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 11) {
        validateField(name, value, { phone: true });
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const rules = {};
    if (name === 'fullName') { rules.required = true; rules.nameOnly = true; }
    else if (name === 'email') { rules.required = true; rules.email = true; }
    else if (name === 'phone') { rules.required = true; rules.phone = true; }
    else if (name === 'package') { rules.required = true; rules.select = !value; }
    else if (name === 'address') { rules.required = true; }
    validateField(name, value, rules);
  };

  const handleSubmit = async (e) => {
    const fields = [
      { name: 'fullName', value: form.fullName, rules: { required: true, nameOnly: true } },
      { name: 'email', value: form.email, rules: { required: true, email: true } },
      { name: 'phone', value: form.phone, rules: { required: true, phone: true } },
      { name: 'package', value: form.package, rules: { required: true, select: !form.package } },
      { name: 'address', value: form.address, rules: { required: true } },
    ];

    const isValid = validateAll(fields);

    if (!isValid) {
      e.preventDefault();
      const firstError = formRef.current?.querySelector('.form-group.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);

    // Save booking to Firebase Firestore
    try {
      await addBooking({
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        package: form.package,
        address: form.address,
        message: form.message,
        source: 'website'
      });
    } catch (err) {
      console.error('Firebase save error (form still submits via FormSubmit):', err);
    }

    // Let the form submit naturally to FormSubmit
  };

  return (
    <section className="section book-now-section" id="book-now">
      <div className="container">
        <h2 className="section-title gradient-text shimmer">📝 Book Your Connection Now</h2>
        <p className="section-subtitle">
          Fill in the form below and get connected to high-speed internet today!
        </p>

        <div className="book-now-card glass-card">
          <form
            className="book-now-form"
            id="bookNowForm"
            ref={formRef}
            action="https://formsubmit.co/nbbshahkhailghari@gmail.com"
            method="POST"
            onSubmit={handleSubmit}
          >
            {/* FormSubmit Hidden Fields */}
            <input type="hidden" name="_subject" value="New Ubadah Form Submission" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_next" value="https://musa-010.github.io/Ubadah/thank-you.html" />
            <input type="text" name="_honey" style={{ display: 'none' }} />

            <div className="form-row">
              <div className={`form-group${errors.fullName ? ' error' : ''}`}>
                <label htmlFor="bookFullName">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="bookFullName"
                  name="fullName"
                  required
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="error-message">{errors.fullName || ''}</span>
              </div>

              <div className={`form-group${errors.email ? ' error' : ''}`}>
                <label htmlFor="bookEmail">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="bookEmail"
                  name="email"
                  required
                  placeholder="your.email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="error-message">{errors.email || ''}</span>
              </div>
            </div>

            <div className="form-row">
              <div className={`form-group${errors.phone ? ' error' : ''}`}>
                <label htmlFor="bookPhone">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="bookPhone"
                  name="phone"
                  required
                  placeholder="03001234567 (11 digits required)"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="11"
                  minLength="11"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="error-message">{errors.phone || ''}</span>
              </div>

              <div className={`form-group${errors.package ? ' error' : ''}`}>
                <label htmlFor="bookPackage">
                  Select Package <span className="required">*</span>
                </label>
                <select
                  id="bookPackage"
                  name="package"
                  required
                  value={form.package}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Choose your package...</option>
                  <option value="polo-10mb">Polo 10MB - Rs. 3,000/month</option>
                  <option value="super-6mb">Super 6MB - Rs. 3,248/month</option>
                  <option value="super-8mb">Super 8MB - Rs. 3,800/month</option>
                  <option value="super-10mb">Super 10MB - Rs. 4,300/month</option>
                  <option value="super-12mb">Super 12MB - Rs. 4,610/month</option>
                </select>
                <span className="error-message">{errors.package || ''}</span>
              </div>
            </div>

            <div className={`form-group${errors.address ? ' error' : ''}`}>
              <label htmlFor="bookAddress">
                Installation Address <span className="required">*</span>
              </label>
              <textarea
                id="bookAddress"
                name="address"
                required
                placeholder="Enter your complete installation address"
                rows="3"
                value={form.address}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <span className="error-message">{errors.address || ''}</span>
            </div>

            <div className="form-group">
              <label htmlFor="bookMessage">Message / Notes (Optional)</label>
              <textarea
                id="bookMessage"
                name="message"
                placeholder="Any special requirements or notes..."
                rows="4"
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <button type="submit" className="book-now-submit-btn" disabled={submitting}>
              <span className="btn-text">{submitting ? 'Submitting...' : 'Complete Booking'}</span>
              <span className="btn-icon">{submitting ? '⏳' : '🚀'}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
