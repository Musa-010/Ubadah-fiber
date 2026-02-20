import React, { useState, useEffect } from 'react';
import { getDashboardStats, getUsers, getPayments } from '../../firebase/firebaseService';
import { FiUsers, FiPackage, FiCreditCard, FiCalendar, FiAlertCircle, FiLayers, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#2dd4bf', '#818cf8', '#f9a8d4', '#fcd34d', '#60a5fa', '#4ade80'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalPayments: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    openComplaints: 0,
    totalComplaints: 0
  });
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [packageDistribution, setPackageDistribution] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);

      // Build real charts from Firebase data
      const [users, payments] = await Promise.all([getUsers(), getPayments()]);

      // Monthly user registrations (last 12 months)
      const now = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyMap = {};
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = { name: monthNames[d.getMonth()], revenue: 0, users: 0 };
      }

      users.forEach(u => {
        const date = u.createdAt?.toDate ? u.createdAt.toDate() : (u.createdAt ? new Date(u.createdAt) : null);
        if (date) {
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyMap[key]) monthlyMap[key].users += 1;
        }
      });

      payments.forEach(p => {
        const date = p.createdAt?.toDate ? p.createdAt.toDate() : (p.createdAt ? new Date(p.createdAt) : null);
        if (date) {
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyMap[key]) monthlyMap[key].revenue += (p.amount || 0);
        }
      });

      setMonthlyData(Object.values(monthlyMap));

      // Package distribution from real users
      const pkgCount = {};
      users.forEach(u => {
        const pkg = u.package || 'Unassigned';
        const simpleName = pkg.includes('Basic') ? 'Basic' : pkg.includes('Standard') ? 'Standard' : pkg.includes('Premium') ? 'Premium' : pkg;
        pkgCount[simpleName] = (pkgCount[simpleName] || 0) + 1;
      });

      const total = users.length || 1;
      const pkgDist = Object.entries(pkgCount).map(([name, count]) => ({
        name,
        value: Math.round((count / total) * 100)
      }));
      setPackageDistribution(pkgDist.length > 0 ? pkgDist : [{ name: 'No Data', value: 100 }]);

    } catch (err) {
      console.error('Error loading stats:', err);
    }
    setLoading(false);
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <FiUsers />, color: 'teal', change: '+12%', direction: 'up' },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: <FiLayers />, color: 'purple', change: '+8%', direction: 'up' },
    { label: 'Total Revenue', value: `Rs.${stats.totalRevenue.toLocaleString()}`, icon: <FiCreditCard />, color: 'green', change: '+15%', direction: 'up' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: <FiCalendar />, color: 'yellow', change: stats.pendingBookings > 0 ? 'Needs attention' : 'All clear', direction: stats.pendingBookings > 0 ? 'down' : 'up' },
    { label: 'Open Complaints', value: stats.openComplaints, icon: <FiAlertCircle />, color: 'red', change: stats.openComplaints > 0 ? 'Needs attention' : 'All clear', direction: stats.openComplaints > 0 ? 'down' : 'up' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: <FiPackage />, color: 'blue' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#1a2332',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#e2e8f0',
          fontSize: '13px'
        }}>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
          {payload.map((item, i) => (
            <p key={i} style={{ color: item.color }}>
              {item.name}: {item.name === 'revenue' ? `Rs.${item.value.toLocaleString()}` : item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="admin-loading" style={{ minHeight: '400px' }}>
        <div className="admin-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <button className="admin-btn admin-btn-secondary" onClick={loadStats}>
          <FiActivity /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="admin-stat-card">
            <div className="admin-stat-header">
              <div>
                <div className="admin-stat-value">{card.value}</div>
                <div className="admin-stat-label">{card.label}</div>
              </div>
              <div className={`admin-stat-icon ${card.color}`}>
                {card.icon}
              </div>
            </div>
            {card.change && (
              <div className={`admin-stat-change ${card.direction}`}>
                {card.direction === 'up' ? <FiTrendingUp /> : '⚠️'} {card.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <h3>Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#2dd4bf" fillOpacity={1} fill="url(#revenueGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-chart-card">
          <h3>User Growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="users" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <h3>Package Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={packageDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {packageDistribution.map((entry, i) => (
                  <Cell key={i} fill={CHART_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: -10 }}>
            {packageDistribution.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[i], display: 'inline-block' }}></span>
                {item.name} ({item.value}%)
              </div>
            ))}
          </div>
        </div>

        <div className="admin-chart-card">
          <h3>Quick Summary</h3>
          <ul className="admin-activity-list">
            <li className="admin-activity-item">
              <div className="admin-activity-dot green"></div>
              <div>
                <div className="admin-activity-text"><strong>{stats.totalUsers}</strong> registered users</div>
                <div className="admin-activity-time">Total users in system</div>
              </div>
            </li>
            <li className="admin-activity-item">
              <div className="admin-activity-dot blue"></div>
              <div>
                <div className="admin-activity-text"><strong>{stats.totalBookings}</strong> total bookings received</div>
                <div className="admin-activity-time">{stats.pendingBookings} pending</div>
              </div>
            </li>
            <li className="admin-activity-item">
              <div className="admin-activity-dot yellow"></div>
              <div>
                <div className="admin-activity-text"><strong>{stats.totalSubscriptions}</strong> subscriptions</div>
                <div className="admin-activity-time">{stats.activeSubscriptions} currently active</div>
              </div>
            </li>
            <li className="admin-activity-item">
              <div className="admin-activity-dot red"></div>
              <div>
                <div className="admin-activity-text"><strong>{stats.totalComplaints}</strong> complaints filed</div>
                <div className="admin-activity-time">{stats.openComplaints} open</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
