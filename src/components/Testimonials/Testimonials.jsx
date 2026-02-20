import React from 'react';
import testimonials, { trustBadges } from '../../data/testimonials';

function TestimonialCard({ t }) {
  return (
    <div className="testimonial-card glass-card hover-lift">
      <div className="stars">
        {'⭐'.repeat(t.stars)}
      </div>
      <p className="testimonial-text">{t.text}</p>
      <div className="client-info">
        <div className="client-avatar">{t.initials}</div>
        <div>
          <h4 className="client-name">{t.name}</h4>
          <p className="client-role">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="section testimonials-section" id="testimonials">
      <div className="container">
        <h2 className="section-title gradient-text shimmer">What Our Clients Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="trust-badges">
          <h3 className="trust-title">Trusted by Leading Companies</h3>
          <div className="trust-logos">
            {trustBadges.map((badge, i) => (
              <div className="trust-logo" key={i}>
                {badge.emoji} {badge.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
