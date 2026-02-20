import React, { useState, useEffect } from 'react';

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

export default function AnimatedBackground() {
  const isMobile = useIsMobile();

  // On mobile: render only a static gradient background — no blobs, particles, or animated gradient
  if (isMobile) {
    return (
      <div className="bg-canvas" style={{ background: 'linear-gradient(135deg, #0B1120 0%, #0F1B2E 50%, #111827 100%)' }} />
    );
  }

  return (
    <div className="bg-canvas">
      <div className="animated-gradient"></div>
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="blob blob3"></div>
      <div className="blob blob4"></div>
      <div className="blob blob5"></div>
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
    </div>
  );
}
