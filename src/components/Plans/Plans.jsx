import React, { useCallback } from 'react';
import plans from '../../data/plans';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

function PlanCard({ plan }) {
  const [ref, isVisible] = useIntersectionObserver();

  const handleClick = useCallback(() => {
    const packageSelect = document.getElementById('bookPackage');
    if (packageSelect && plan.optionValue) {
      packageSelect.value = plan.optionValue;
    }
    const bookForm = document.getElementById('book-now');
    if (bookForm) {
      bookForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const firstInput = document.getElementById('bookFullName');
        if (firstInput) firstInput.focus();
      }, 800);
    }
  }, [plan.optionValue]);

  return (
    <div
      className={`plan-card${plan.featured ? ' featured' : ''}${isVisible ? ' animate-in' : ''}`}
      ref={ref}
      tabIndex="0"
      role="button"
    >
      {plan.ribbon && <div className="plan-ribbon">{plan.ribbon}</div>}
      <h3 className="plan-name">{plan.name}</h3>
      <div className="plan-price">
        {plan.price}
        <span style={{ fontSize: '1.5rem' }}>/mo</span>
      </div>
      <p className="plan-period">{plan.period}</p>
      <ul className="plan-features">
        {plan.features.map((f, i) => (
          <li key={i}>
            {f.bold && <strong>{f.bold}</strong>}
            {f.text}
          </li>
        ))}
      </ul>
      <button className="plan-btn" data-plan={plan.dataPlan} onClick={handleClick}>
        {plan.btnText}
      </button>
    </div>
  );
}

export default function Plans() {
  return (
    <section className="section" id="plans">
      <div className="container">
        <h2 className="section-title">💎 Package Categories</h2>
        <div className="plans-grid">
          {plans.map((plan, i) => (
            <PlanCard key={i} plan={plan} />
          ))}
        </div>

        {/* Installation Info Note */}
        <div className="installation-info">
          <h3>🧾 Installation Information</h3>
          <p>
            <strong>Installation fee is Rs. 7,500</strong> (includes 50 meters of wire). An additional{' '}
            <strong>Rs. 40 will be charged per extra meter</strong> beyond 50 meters.
          </p>
        </div>
      </div>
    </section>
  );
}
