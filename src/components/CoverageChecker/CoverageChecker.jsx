import React, { useState, useRef } from 'react';
import { useToast } from '../../context/ToastContext';

export default function CoverageChecker() {
  const showToast = useToast();
  const [zip, setZip] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const handleZipChange = (e) => {
    setZip(e.target.value.replace(/\D/g, '').slice(0, 5));
  };

  const checkCoverage = () => {
    if (!/^\d{5}$/.test(zip)) {
      setResult({
        type: 'error',
        title: '❌ Invalid ZIP Code',
        text: 'Please enter a valid 5-digit ZIP code.',
      });
      showToast('Please enter a valid ZIP code', 'error');
      return;
    }

    setChecking(true);
    setResult(null);

    setTimeout(() => {
      const isCovered = Math.random() > 0.2;

      if (isCovered) {
        setResult({
          type: 'success',
          title: '🎉 Great News!',
          text: `Fiber internet is available in your area (${zip}). Our fastest plan offers speeds up to 1000 Mbps with no data caps, no contracts, and 24/7 support!`,
        });
        showToast('Fiber is available in your area!', 'success');
      } else {
        setResult({
          type: 'error',
          title: '📍 Not Yet Available',
          text: `We're not in ${zip} yet, but we're expanding rapidly! Leave your email and we'll notify you when we arrive in your area.`,
        });
        showToast("Area not covered yet. We'll notify you when we expand!", 'error');
      }
      setChecking(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') checkCoverage();
  };

  return (
    <section className="section coverage-section" id="coverage">
      <div className="container">
        <h2 className="section-title gradient-text shimmer">📍 Check Coverage in Your Area</h2>
        <p className="section-subtitle">
          Enter your ZIP code to see if our fiber network is available
        </p>
        <div className="coverage-checker glass-card">
          <div className="coverage-input-group">
            <input
              type="text"
              id="zipInput"
              ref={inputRef}
              placeholder="Enter ZIP Code (e.g., 12345)"
              maxLength="5"
              pattern="[0-9]{5}"
              aria-label="ZIP Code"
              value={zip}
              onChange={handleZipChange}
              onKeyPress={handleKeyPress}
            />
            <button
              id="checkCoverageBtn"
              className="check-coverage-btn"
              onClick={checkCoverage}
              disabled={checking}
            >
              {checking ? 'Checking...' : 'Check Availability'}
            </button>
          </div>
          {result && (
            <div className={`coverage-result ${result.type} show`}>
              <h3>{result.title}</h3>
              <p>{result.text}</p>
              {result.type === 'success' && (
                <p style={{ marginTop: '1rem' }}>
                  <a
                    href="#plans"
                    className="inline-link"
                    style={{ color: 'var(--teal)', textDecoration: 'underline' }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    View our plans →
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
