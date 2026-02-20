import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Layout
import AnimatedBackground from './components/Layout/AnimatedBackground';
import ScrollProgressBar from './components/Layout/ScrollProgressBar';
import ScrollToTop from './components/Layout/ScrollToTop';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Sections
import Hero from './components/Hero/Hero';
import Features from './components/Features/Features';
import Plans from './components/Plans/Plans';
import BookNow from './components/BookNow/BookNow';
import SpeedTest from './components/SpeedTest/SpeedTest';
import CoverageChecker from './components/CoverageChecker/CoverageChecker';
import FAQ from './components/FAQ/FAQ';
import Testimonials from './components/Testimonials/Testimonials';

// UI
import ChatWidget from './components/UI/ChatWidget';
import BookingModal from './components/UI/BookingModal';

// Pages
import ThankYou from './pages/ThankYou';

// Admin
import AdminLogin from './pages/Admin/AdminLogin';
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import UsersPage from './pages/Admin/UsersPage';
import PackagesPage from './pages/Admin/PackagesPage';
import SubscriptionsPage from './pages/Admin/SubscriptionsPage';
import PaymentsPage from './pages/Admin/PaymentsPage';
import BookingsPage from './pages/Admin/BookingsPage';
import ComplaintsPage from './pages/Admin/ComplaintsPage';
import ReportsPage from './pages/Admin/ReportsPage';
import InvoicesPage from './pages/Admin/InvoicesPage';
import ProtectedRoute from './components/Admin/ProtectedRoute';

function HomePage() {
  // Parallax mouse movement for blobs
  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const handleMouseMove = (e) => {
      const blobs = document.querySelectorAll('.blob');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 20;
        const moveX = (x - 0.5) * speed;
        const moveY = (y - 0.5) * speed;
        blob.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Ripple effect on buttons
  useEffect(() => {
    const createRipple = (e) => {
      const button = e.currentTarget;
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
        z-index: 1;
      `;

      if (getComputedStyle(button).position === 'static') {
        button.style.position = 'relative';
      }
      button.style.overflow = 'hidden';
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    // Add ripple animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary, .nav-cta');
    buttons.forEach((btn) => btn.addEventListener('click', createRipple));

    return () => {
      buttons.forEach((btn) => btn.removeEventListener('click', createRipple));
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  // Particle network canvas
  useEffect(() => {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0.5;';
    hero.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    function resize() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
      init();
    }

    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
    }

    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20, 184, 166, 0.6)';
      ctx.fill();
    };

    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    };

    function init() {
      particles = [];
      const count = Math.min(50, Math.floor(canvas.width / 20));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(20, 184, 166, ${0.2 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return (
    <>
      <ScrollProgressBar />
      <ScrollToTop />
      <AnimatedBackground />
      <Navbar />
      <Hero />
      <Features />
      <Plans />
      <BookNow />
      <SpeedTest />
      <CoverageChecker />
      <FAQ />
      <Testimonials />
      <Footer />
      <BookingModal />
      <ChatWidget />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/thank-you" element={<ThankYou />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="packages" element={<PackagesPage />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="complaints" element={<ComplaintsPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
