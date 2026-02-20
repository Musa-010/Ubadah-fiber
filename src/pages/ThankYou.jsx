import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ThankYou() {
  useEffect(() => {
    // Auto-redirect after 35 seconds
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 35000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: 'linear-gradient(135deg, #0a0f1e 0%, #1e293b 100%)',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated gradient background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(-45deg, #14b8a6, #7c3aed, #ec4899, #f59e0b)',
          backgroundSize: '400% 400%',
          animation: 'gradientFlow 15s ease infinite',
          opacity: 0.1,
        }}
      />

      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          textAlign: 'center',
          maxWidth: 600,
          padding: '3rem 2rem',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 20,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.8s ease',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem', animation: 'scaleIn 0.6s ease 0.3s backwards' }}>
          🎉
        </div>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #14b8a6, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Thank You!
        </h1>
        <p style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.8)' }}>
          Your booking request has been submitted successfully. Our team will contact you within 24 hours to confirm your connection and schedule the installation.
        </p>

        <Link
          to="/"
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #14b8a6, #0891b2)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 12,
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(20, 184, 166, 0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          ← Back to Home
        </Link>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#14b8a6' }}>
            Need immediate assistance?
          </h3>
          <p style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            📞 Call us: <strong>+92 3145205027 UBADAH</strong>
          </p>
          <p style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            📧 Email: <strong>nbbshahkhailghari@gmail.com</strong>
          </p>
          <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            ⏰ Available 24/7 for your convenience
          </p>
        </div>
      </div>
    </div>
  );
}
