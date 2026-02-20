import React, { useState, useEffect } from 'react';
import { getPayments, getUsers, getSubscriptions, getBookings, getComplaints } from '../../firebase/firebaseService';
import { FiDownload } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#2dd4bf', '#818cf8', '#f9a8d4', '#fcd34d', '#60a5fa', '#4ade80'];

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [pay, usr, sub, book, comp] = await Promise.all([
        getPayments(), getUsers(), getSubscriptions(), getBookings(), getComplaints()
      ]);
      setPayments(pay); setUsers(usr); setSubscriptions(sub); setBookings(book); setComplaints(comp);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Revenue by method
  const revenueByMethod = payments.reduce((acc, p) => {
    const method = p.method || 'Unknown';
    acc[method] = (acc[method] || 0) + (p.amount || 0);
    return acc;
  }, {});
  const methodData = Object.entries(revenueByMethod).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  // Package distribution
  const packageDist = users.reduce((acc, u) => {
    const pkg = u.package || 'No Package';
    acc[pkg] = (acc[pkg] || 0) + 1;
    return acc;
  }, {});
  const packageData = Object.entries(packageDist).map(([name, value]) => ({ name, value }));

  // Complaint status distribution
  const complaintDist = complaints.reduce((acc, c) => {
    acc[c.status || 'unknown'] = (acc[c.status || 'unknown'] || 0) + 1;
    return acc;
  }, {});
  const complaintData = Object.entries(complaintDist).map(([name, value]) => ({ name, value }));

  // Booking status
  const bookingDist = bookings.reduce((acc, b) => {
    acc[b.status || 'unknown'] = (acc[b.status || 'unknown'] || 0) + 1;
    return acc;
  }, {});
  const bookingData = Object.entries(bookingDist).map(([name, value]) => ({ name, value }));

  // Monthly revenue (from payment months)
  const monthlyRev = payments.reduce((acc, p) => {
    const month = p.month || 'Unknown';
    acc[month] = (acc[month] || 0) + (p.amount || 0);
    return acc;
  }, {});
  const monthlyData = Object.entries(monthlyRev).sort().map(([name, revenue]) => ({ name, revenue }));

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', color: '#e2e8f0', fontSize: 13 }}>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
          {payload.map((item, i) => (
            <p key={i} style={{ color: item.color }}>
              {item.name}: {typeof item.value === 'number' && item.value > 100 ? `Rs.${item.value.toLocaleString()}` : item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const exportCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => {
      let val = row[h];
      if (val && val.toDate) val = val.toDate().toISOString();
      return `"${val || ''}"`;
    }).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="admin-loading" style={{ minHeight: '400px' }}><div className="admin-spinner"></div><p>Loading reports...</p></div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Reports & Analytics</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="admin-btn admin-btn-secondary" onClick={() => exportCSV(users, 'users-report')}><FiDownload /> Export Users</button>
          <button className="admin-btn admin-btn-secondary" onClick={() => exportCSV(payments, 'payments-report')}><FiDownload /> Export Payments</button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card"><div className="admin-stat-value">Rs.{totalRevenue.toLocaleString()}</div><div className="admin-stat-label">Total Revenue</div></div>
        <div className="admin-stat-card"><div className="admin-stat-value">{users.length}</div><div className="admin-stat-label">Total Users</div></div>
        <div className="admin-stat-card"><div className="admin-stat-value">{subscriptions.filter(s => s.status === 'active').length}</div><div className="admin-stat-label">Active Subscriptions</div></div>
        <div className="admin-stat-card"><div className="admin-stat-value">{complaints.filter(c => c.status === 'resolved').length}/{complaints.length}</div><div className="admin-stat-label">Resolved Complaints</div></div>
      </div>

      {/* Charts Row 1 */}
      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <h3>Monthly Revenue</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="admin-empty"><p>No payment data yet</p></div>}
        </div>

        <div className="admin-chart-card">
          <h3>Revenue by Payment Method</h3>
          {methodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={methodData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                  {methodData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="admin-empty"><p>No payment data yet</p></div>}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <h3>User Package Distribution</h3>
          {packageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={packageData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                  {packageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="admin-empty"><p>No user data yet</p></div>}
        </div>

        <div className="admin-chart-card">
          <h3>Booking Status</h3>
          {bookingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="admin-empty"><p>No booking data yet</p></div>}
        </div>
      </div>

      {/* Complaint Analysis */}
      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <h3>Complaint Status</h3>
          {complaintData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={complaintData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                  {complaintData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="admin-empty"><p>No complaint data yet</p></div>}
        </div>

        <div className="admin-chart-card">
          <h3>Key Metrics Summary</h3>
          <div style={{ padding: '12px 0' }}>
            <ul className="admin-activity-list">
              <li className="admin-activity-item"><div className="admin-activity-dot green"></div><div><div className="admin-activity-text">Average Revenue per User: <strong>Rs.{users.length ? Math.round(totalRevenue / users.length).toLocaleString() : 0}</strong></div></div></li>
              <li className="admin-activity-item"><div className="admin-activity-dot blue"></div><div><div className="admin-activity-text">Booking Conversion: <strong>{bookings.length ? Math.round(bookings.filter(b => b.status === 'completed').length / bookings.length * 100) : 0}%</strong></div></div></li>
              <li className="admin-activity-item"><div className="admin-activity-dot yellow"></div><div><div className="admin-activity-text">Complaint Resolution Rate: <strong>{complaints.length ? Math.round(complaints.filter(c => c.status === 'resolved').length / complaints.length * 100) : 0}%</strong></div></div></li>
              <li className="admin-activity-item"><div className="admin-activity-dot red"></div><div><div className="admin-activity-text">Active to Total Users: <strong>{users.length ? Math.round(users.filter(u => u.status === 'active').length / users.length * 100) : 0}%</strong></div></div></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
