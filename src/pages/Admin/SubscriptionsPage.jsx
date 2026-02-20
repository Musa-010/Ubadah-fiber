import React, { useState, useEffect } from 'react';
import { getSubscriptions, addSubscription, updateSubscription, deleteSubscription, getUsers, getPackages } from '../../firebase/firebaseService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiLayers } from 'react-icons/fi';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState({ userId: '', userName: '', packageName: '', monthlyPrice: '', startDate: '', endDate: '', status: 'active' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [subs, usr, pkg] = await Promise.all([getSubscriptions(), getUsers(), getPackages()]);
      setSubscriptions(subs); setUsers(usr); setPackages(pkg);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, monthlyPrice: Number(form.monthlyPrice) };
    try {
      if (editingSub) { await updateSubscription(editingSub.id, data); } else { await addSubscription(data); }
      setShowModal(false); setEditingSub(null);
      setForm({ userId: '', userName: '', packageName: '', monthlyPrice: '', startDate: '', endDate: '', status: 'active' });
      loadAll();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (sub) => {
    setEditingSub(sub);
    setForm({
      userId: sub.userId || '', userName: sub.userName || '', packageName: sub.packageName || '',
      monthlyPrice: sub.monthlyPrice || '', startDate: sub.startDate || '', endDate: sub.endDate || '', status: sub.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try { await deleteSubscription(id); setShowDelete(null); loadAll(); } catch (err) { console.error(err); }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') return timestamp;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filtered = subscriptions.filter(s => {
    const matchSearch = s.userName?.toLowerCase().includes(search.toLowerCase()) || s.packageName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="admin-loading" style={{ minHeight: '400px' }}><div className="admin-spinner"></div><p>Loading subscriptions...</p></div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Subscriptions</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditingSub(null); setForm({ userId: '', userName: '', packageName: '', monthlyPrice: '', startDate: '', endDate: '', status: 'active' }); setShowModal(true); }}>
          <FiPlus /> Add Subscription
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-toolbar">
            <div className="admin-search-input"><FiSearch /><input type="text" placeholder="Search subscriptions..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select className="admin-filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option><option value="active">Active</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty"><FiLayers /><h3>No subscriptions found</h3><p>Add your first subscription to get started</p></div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>User</th><th>Package</th><th>Monthly (Rs.)</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id}>
                    <td><strong>{sub.userName}</strong></td>
                    <td>{sub.packageName}</td>
                    <td>Rs.{sub.monthlyPrice?.toLocaleString()}</td>
                    <td>{formatDate(sub.startDate)}</td>
                    <td>{formatDate(sub.endDate)}</td>
                    <td><span className={`admin-badge ${sub.status}`}>{sub.status}</span></td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn-icon" onClick={() => handleEdit(sub)}><FiEdit2 /></button>
                        <button className="admin-btn-icon danger" onClick={() => setShowDelete(sub)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3>{editingSub ? 'Edit Subscription' : 'Add Subscription'}</h3><button className="admin-modal-close" onClick={() => setShowModal(false)}><FiX /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group"><label className="admin-form-label">User *</label>
                    <select className="admin-form-select" value={form.userName} onChange={(e) => {
                      const user = users.find(u => u.name === e.target.value);
                      setForm({ ...form, userName: e.target.value, userId: user?.id || '' });
                    }} required>
                      <option value="">Select User</option>
                      {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="admin-form-group"><label className="admin-form-label">Package *</label>
                    <select className="admin-form-select" value={form.packageName} onChange={(e) => {
                      const pkg = packages.find(p => p.name === e.target.value);
                      setForm({ ...form, packageName: e.target.value, monthlyPrice: pkg?.monthlyPrice || '' });
                    }} required>
                      <option value="">Select Package</option>
                      {packages.map(p => <option key={p.id} value={p.name}>{p.name} - Rs.{p.monthlyPrice}</option>)}
                    </select>
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label className="admin-form-label">Monthly Price (Rs.)</label><input className="admin-form-input" type="number" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} /></div>
                  <div className="admin-form-group"><label className="admin-form-label">Status</label>
                    <select className="admin-form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option></select>
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label className="admin-form-label">Start Date</label><input className="admin-form-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                  <div className="admin-form-group"><label className="admin-form-label">End Date</label><input className="admin-form-input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingSub ? 'Update' : 'Add Subscription'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="admin-modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3>Confirm Delete</h3><button className="admin-modal-close" onClick={() => setShowDelete(null)}><FiX /></button></div>
            <div className="admin-modal-body"><p className="admin-confirm-text">Delete subscription for <strong>{showDelete.userName}</strong>?</p></div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowDelete(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(showDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
