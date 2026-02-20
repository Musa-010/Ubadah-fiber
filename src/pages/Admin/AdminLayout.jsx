import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiUsers, FiPackage, FiCreditCard,
  FiCalendar, FiAlertCircle, FiBarChart2,
  FiLogOut, FiMenu, FiX, FiWifi, FiLayers, FiFileText
} from 'react-icons/fi';
import './AdminStyles.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { path: '/admin/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FiUsers />, label: 'Users' },
    { path: '/admin/packages', icon: <FiPackage />, label: 'Packages' },
    { path: '/admin/subscriptions', icon: <FiLayers />, label: 'Subscriptions' },
    { path: '/admin/payments', icon: <FiCreditCard />, label: 'Payments' },
    { path: '/admin/invoices', icon: <FiFileText />, label: 'Invoices' },
    { path: '/admin/bookings', icon: <FiCalendar />, label: 'Bookings' },
    { path: '/admin/complaints', icon: <FiAlertCircle />, label: 'Complaints' },
    { path: '/admin/reports', icon: <FiBarChart2 />, label: 'Reports' }
  ];

  return (
    <div className="admin-wrapper">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <FiWifi size={28} />
          <span>Ubadah Admin</span>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">Admin</span>
              <span className="admin-user-email">{currentUser?.email || 'admin@ubadah.com'}</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <div className="admin-header-title">
            <h2>Admin Panel</h2>
          </div>
          <div className="admin-header-right">
            <a href="/" className="admin-view-site-btn" target="_blank" rel="noreferrer">
              View Site ↗
            </a>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
