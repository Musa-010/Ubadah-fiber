import React from 'react';

export default function SpeedTest() {
  const handleClick = () => {
    window.location.href = 'https://www.speedtest.net';
  };

  return (
    <section className="section speed-test-section" id="speed-test">
      <div className="container">
        <h2 className="section-title gradient-text shimmer">🚀 Test Your Current Speed</h2>
        <p className="section-subtitle">
          See how your current connection compares to our lightning-fast fiber speeds
        </p>
        <div className="speed-test-card glass-card">
          <button className="test-speed-btn" onClick={handleClick}>
            <span>Run Speed Test</span>
            <span className="btn-pulse"></span>
          </button>
        </div>
      </div>
    </section>
  );
}
