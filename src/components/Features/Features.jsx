import React from 'react';
import features from '../../data/features';
import use3DTilt from '../../hooks/use3DTilt';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

function FeatureCard({ icon, title, desc }) {
  const tiltRef = use3DTilt(10);
  const [obsRef, isVisible] = useIntersectionObserver();

  return (
    <div
      className={`feature-card${isVisible ? ' animate-in' : ''}`}
      ref={(el) => {
        tiltRef.current = el;
        obsRef.current = el;
      }}
      tabIndex="0"
      role="button"
    >
      <span className="feature-icon">{icon}</span>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section className="section" id="services">
      <div className="container">
        <h2 className="section-title">Why Choose FiberLink?</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} />
          ))}
        </div>
      </div>
    </section>
  );
}
