import { useState, useEffect, useRef } from 'react';

export default function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      // Throttle with requestAnimationFrame to prevent excessive re-renders
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          setProgress((scrollTop / docHeight) * 100);
        }
        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return progress;
}
