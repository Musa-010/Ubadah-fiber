import React, { useState, useEffect, useRef, useCallback } from 'react';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= breakpoint
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

export default function Hero() {
  const [displayText, setDisplayText] = useState('');
  const [counter, setCounter] = useState(0);
  const heroCardRef = useRef(null);
  const fullText = 'Connect Smarter, Live Faster';
  const isMobile = useIsMobile();

  // Typing effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // Counter animation — simplified on mobile (no 60fps, no fluctuation)
  useEffect(() => {
    const target = 12847;

    if (isMobile) {
      // On mobile: just set the final value immediately, no animation
      setCounter(target);
      return;
    }

    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setCounter(Math.floor(current));
    }, 16);

    // Random fluctuation
    const fluctuation = setInterval(() => {
      const variance = Math.floor(Math.random() * 10) - 5;
      setCounter(target + variance);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(fluctuation);
    };
  }, [isMobile]);

  // Hero card 3D tilt effect — desktop only
  useEffect(() => {
    if (isMobile) return;
    const card = heroCardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMobile]);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <section className="hero" id="home">
      {/* Floating 3D Blobs — desktop only */}
      {!isMobile && (
        <>
          <div className="floating-blob-1"></div>
          <div className="floating-blob-2"></div>
          <div className="floating-blob-3"></div>
        </>
      )}

      <div className="hero-card" ref={heroCardRef}>
        <div className="hero-logo">⚡</div>
        <h1 className="tagline" id="typingTagline">
          {displayText}
          {displayText.length < fullText.length && (
            <span style={{ borderRight: '3px solid var(--teal)', paddingRight: '5px' }}>&nbsp;</span>
          )}
        </h1>
        <div className="stats-container">
          <div className="counter" id="counter">
            {counter.toLocaleString()}
          </div>
          <div className="counter-label">Active Connections</div>
          <div className="status-pill">
            <span className="status-dot"></span>
            All Systems Operational
          </div>
        </div>
        <div className="cta-buttons">
          <button className="btn-primary" onClick={() => scrollTo('plans')}>
            Get Started
          </button>
          <button className="btn-secondary" onClick={() => scrollTo('plans')}>
            Explore Plans
          </button>
        </div>
      </div>
    </section>
  );
}
