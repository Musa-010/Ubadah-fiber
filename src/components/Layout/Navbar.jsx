import React, { useState, useEffect, useCallback } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.pageYOffset > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active nav link tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.pageYOffset + 150;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(section.getAttribute('id'));
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const smoothScroll = useCallback((e, sectionId) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileOpen(false);
    document.body.style.overflow = '';
  }, []);

  const toggleMobile = () => {
    setMobileOpen((prev) => {
      if (!prev) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return !prev;
    });
  };

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
        document.body.style.overflow = '';
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [mobileOpen]);

  // Close on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handleClick = (e) => {
      if (
        !e.target.closest('.nav-links') &&
        !e.target.closest('.mobile-menu-btn')
      ) {
        setMobileOpen(false);
        document.body.style.overflow = '';
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [mobileOpen]);

  const navItems = [
    { href: 'home', label: 'Home' },
    { href: 'services', label: 'Services' },
    { href: 'plans', label: 'Plans' },
    { href: 'about', label: 'About' },
    { href: 'contact', label: 'Contact' },
  ];

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <nav>
        <div className="logo">⚡ National BroadBand</div>
        <ul className={`nav-links${mobileOpen ? ' mobile-active' : ''}`}>
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={`#${item.href}`}
                className={activeSection === item.href ? 'active' : ''}
                onClick={(e) => smoothScroll(e, item.href)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#book-now"
          className="nav-cta"
          onClick={(e) => smoothScroll(e, 'book-now')}
        >
          Book Now
        </a>
        <button
          className="mobile-menu-btn"
          aria-label="Toggle mobile menu"
          onClick={toggleMobile}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </nav>
    </header>
  );
}
