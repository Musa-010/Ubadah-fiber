import React, { useState, useEffect } from 'react';
import useScrollProgress from '../../hooks/useScrollProgress';

export default function ScrollToTop() {
  const progress = useScrollProgress();
  const [visible, setVisible] = useState(false);

  const radius = 20;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`scroll-to-top${visible ? ' visible' : ''}`}
      id="scrollToTop"
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg className="progress-ring" width="50" height="50">
        <circle
          className="progress-ring-circle"
          stroke="var(--teal)"
          strokeWidth="3"
          fill="transparent"
          r={radius}
          cx="25"
          cy="25"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="scroll-arrow">↑</span>
    </button>
  );
}
